/**
 * List Newest Jobs from Drupal
 *
 * Fetches and displays the 90 newest jobs from Drupal
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { DrupalFetcher } from './drupal-fetcher';

async function listNewestJobs() {
  try {
    console.log('📥 Fetching newest 90 jobs from Drupal');
    console.log('=' .repeat(80));

    const fetcher = new DrupalFetcher();
    const allJobs = await fetcher.fetchJobs();

    // Sort by created timestamp (descending - newest first)
    const sortedJobs = allJobs.sort((a, b) => {
      const timeA = parseInt(a.created);
      const timeB = parseInt(b.created);
      return timeB - timeA;
    });

    // Take the 90 newest
    const newest90 = sortedJobs.slice(0, 90);

    console.log(`\nTotal jobs in Drupal: ${allJobs.length}`);
    console.log(`Showing newest: ${newest90.length}\n`);

    console.log('📋 90 Newest Jobs:');
    console.log('=' .repeat(80));

    newest90.forEach((job, index) => {
      const created = new Date(parseInt(job.created) * 1000);
      const dateStr = created.toISOString().split('T')[0];
      const timeStr = created.toTimeString().split(' ')[0];
      const status = parseInt(job.status) === 1 ? '✅' : '❌';

      console.log(`${(index + 1).toString().padStart(2, ' ')}. [${status}] ${job.title}`);
      console.log(`    NID: ${job.nid} | Type: ${job.type} | Posted: ${dateStr} ${timeStr}`);
      console.log(`    User: ${job.uid} | Status: ${job.status}`);
      console.log('');
    });

    console.log('=' .repeat(80));
    console.log('Legend: ✅ = Published | ❌ = Unpublished');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listNewestJobs();
