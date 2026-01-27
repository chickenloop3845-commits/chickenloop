/**
 * Migrate Job Images from Drupal
 *
 * Fetches images from Drupal, resizes to max 800px width,
 * compresses to under 100KB, and uploads to Vercel Blob
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import mongoose from 'mongoose';
import { DrupalFetcher } from './drupal-fetcher';
import { MIGRATION_CONFIG } from './config';
import Job from '../models/Job';
import { put } from '@vercel/blob';
import sharp from 'sharp';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

const execAsync = promisify(exec);

interface ImageInfo {
  fid: string;
  filename: string;
  uri: string;
  filesize: string;
}

async function migrateJobImages() {
  try {
    console.log('🖼️  Migrating Job Images from Drupal');
    console.log('=' .repeat(60));

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    const uri = MIGRATION_CONFIG.mongodb.uri;
    if (!uri) {
      throw new Error('MONGODB_URI not configured');
    }
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB\n');

    // Get the 30 newest jobs
    const jobs = await Job.find({})
      .sort({ datePosted: -1 })
      .limit(30);

    console.log(`Found ${jobs.length} jobs to process\n`);

    const fetcher = new DrupalFetcher();
    const stats = {
      processed: 0,
      imagesFound: 0,
      imagesUploaded: 0,
      errors: 0,
    };

    // Get all Drupal jobs to match titles
    console.log('📥 Fetching all jobs from Drupal...');
    const drupalJobs = await fetcher.fetchJobs();
    const drupalJobMap = new Map(
      drupalJobs.map(j => [j.title.toLowerCase().trim(), j])
    );

    console.log('🔄 Processing jobs...\n');

    for (const [index, job] of jobs.entries()) {
      try {
        console.log(`\n${index + 1}/30 Processing: ${job.title}`);

        // Find matching Drupal job by title
        const drupalJob = drupalJobMap.get(job.title.toLowerCase().trim());

        if (!drupalJob) {
          console.log(`   ⏭️  No matching Drupal job found`);
          continue;
        }

        const nid = parseInt(drupalJob.nid);
        console.log(`   Found Drupal NID: ${nid}`);

        // Fetch image field data from Drupal
        const imageQuery = `SELECT field_picture_fid FROM field_data_field_picture WHERE entity_id = ${nid} AND entity_type = 'node'`;

        const imageResult = await fetcher.sqlQuery(imageQuery);
        const imageData = parseTabularData(imageResult, ['field_picture_fid']);

        if (imageData.length === 0) {
          console.log(`   📷 No images in Drupal`);
          stats.processed++;
          continue;
        }

        console.log(`   📷 Found ${imageData.length} image(s)`);
        stats.imagesFound += imageData.length;

        const uploadedUrls: string[] = [];

        // Process each image
        for (const imgData of imageData) {
          const fid = imgData.field_picture_fid;

          // Get file info from Drupal
          const fileQuery = `
            SELECT fid, filename, uri, filesize
            FROM file_managed
            WHERE fid = ${fid}
          `;

          const fileResult = await fetcher.sqlQuery(fileQuery);
          const fileInfo = parseTabularData(fileResult, ['fid', 'filename', 'uri', 'filesize']);

          if (fileInfo.length === 0) {
            console.log(`   ❌ File info not found for FID: ${fid}`);
            continue;
          }

          const file = fileInfo[0];
          let drupalUri = file.uri.replace('public://', '').replace('private://', '');

          // Determine the correct file path based on URI scheme
          let remotePath: string;
          if (file.uri.startsWith('private://')) {
            remotePath = `www/chickenloop.com/public_html/sites/default/files/private/${drupalUri}`;
          } else {
            remotePath = `www/chickenloop.com/public_html/sites/default/files/${drupalUri}`;
          }

          console.log(`   📥 Downloading: ${file.filename}`);

          // Download file from Drupal server
          const tmpDir = '/tmp';
          // Sanitize filename for local filesystem
          const safeFilename = file.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
          const tmpFilePath = `${tmpDir}/drupal-${Date.now()}-${safeFilename}`;

          try {
            // Properly escape the remote path for SSH
            const escapedRemotePath = remotePath.replace(/'/g, "'\\''");
            await execAsync(`ssh chickenloop "cat '${escapedRemotePath}'" > "${tmpFilePath}"`);

            // Check if file was downloaded
            const stats = await fs.stat(tmpFilePath);
            if (stats.size === 0) {
              console.log(`   ❌ Failed to download: ${file.filename}`);
              continue;
            }

            console.log(`   ✅ Downloaded (${Math.round(stats.size / 1024)}KB)`);

            // Process image with sharp
            console.log(`   🔧 Resizing and compressing...`);

            let quality = 80;
            let resizedBuffer: Buffer;
            let finalSize: number;

            // Try different quality levels until under 100KB
            do {
              const image = sharp(tmpFilePath);
              const metadata = await image.metadata();

              // Resize to max 800px width, maintaining aspect ratio
              let resizer = image.resize(800, null, {
                fit: 'inside',
                withoutEnlargement: true,
              });

              // Convert and compress based on format
              if (metadata.format === 'png') {
                resizedBuffer = await resizer
                  .png({ quality, compressionLevel: 9 })
                  .toBuffer();
              } else {
                resizedBuffer = await resizer
                  .jpeg({ quality, mozjpeg: true })
                  .toBuffer();
              }

              finalSize = resizedBuffer.length;

              // If still too large, reduce quality
              if (finalSize > 100 * 1024 && quality > 60) {
                quality -= 10;
              } else {
                break;
              }
            } while (finalSize > 100 * 1024 && quality >= 60);

            console.log(`   ✅ Compressed to ${Math.round(finalSize / 1024)}KB (quality: ${quality})`);

            // Upload to Vercel Blob
            console.log(`   ☁️  Uploading to Vercel Blob...`);

            const blobFilename = `jobs/${job._id}-${Date.now()}-${file.filename}`;
            const blob = await put(blobFilename, resizedBuffer, {
              access: 'public',
              contentType: file.filename.endsWith('.png') ? 'image/png' : 'image/jpeg',
            });

            uploadedUrls.push(blob.url);
            stats.imagesUploaded++;

            console.log(`   ✅ Uploaded: ${blob.url}`);

            // Clean up temp file
            await fs.unlink(tmpFilePath);

          } catch (error: any) {
            console.log(`   ❌ Error processing ${file.filename}: ${error.message}`);
            stats.errors++;

            // Clean up temp file on error
            try {
              await fs.unlink(tmpFilePath);
            } catch (e) {}
          }
        }

        // Update job with new image URLs
        if (uploadedUrls.length > 0) {
          await Job.findByIdAndUpdate(job._id, {
            $set: { pictures: uploadedUrls }
          });
          console.log(`   ✅ Updated job with ${uploadedUrls.length} image(s)`);
        }

        stats.processed++;

      } catch (error: any) {
        console.error(`   ❌ Error: ${error.message}`);
        stats.errors++;
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log('📊 Migration Summary:');
    console.log('═'.repeat(60));
    console.log(`Jobs processed:     ${stats.processed}`);
    console.log(`Images found:       ${stats.imagesFound}`);
    console.log(`Images uploaded:    ${stats.imagesUploaded}`);
    console.log(`Errors:             ${stats.errors}`);

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

function parseTabularData(output: string, headers: string[]): any[] {
  const lines = output.trim().split('\n');
  if (lines.length === 0) return [];

  const data: any[] = [];
  for (const line of lines) {
    const values = line.split('\t');
    const row: any = {};

    headers.forEach((header, index) => {
      const value = values[index];
      row[header] = value === 'NULL' || value === undefined ? null : value;
    });

    data.push(row);
  }

  return data;
}

migrateJobImages();
