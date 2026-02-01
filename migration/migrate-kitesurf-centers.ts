/**
 * Migrate Kitesurf Centers from Drupal to MongoDB
 *
 * Migrates kitesurf center listings from Drupal to the Company model in MongoDB
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import mongoose from 'mongoose';
import { DrupalFetcher } from './drupal-fetcher';
import { MIGRATION_CONFIG } from './config';
import User from '../models/User';
import Company from '../models/Company';

async function migrateKitesurfCenters() {
  try {
    console.log('🏄 Migrating Kitesurf Centers from Drupal to MongoDB');
    console.log('='.repeat(60));

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    const uri = MIGRATION_CONFIG.mongodb.uri;
    if (!uri) {
      throw new Error('MONGODB_URI not configured');
    }
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB\n');

    // Fetch all kitesurf centers from Drupal
    const fetcher = new DrupalFetcher();
    const centers = await fetcher.fetchKitesurfCenters();

    console.log(`Total kitesurf centers in Drupal: ${centers.length}\n`);

    const stats = {
      migrated: 0,
      skipped: 0,
      errors: 0,
    };

    // Find or create an admin user to own the centers
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('⚠️  No admin user found, creating one...');
      adminUser = await User.create({
        email: 'admin@chickenloop.com',
        password: 'temp_password_to_be_changed',
        role: 'admin',
        createdAt: new Date(),
      });
      console.log('✅ Created admin user for center ownership\n');
    }

    console.log('🔄 Starting migration of kitesurf centers...\n');

    for (const [index, center] of centers.entries()) {
      try {
        const created = new Date(parseInt(center.created) * 1000);
        const dateStr = created.toISOString().split('T')[0];

        // Check if center already exists by name and creation date
        const existing = await Company.findOne({
          name: center.title,
          createdAt: created,
        });

        if (existing) {
          console.log(`${index + 1}/${centers.length} ⏭️  Already exists: ${center.title} (${dateStr})`);
          stats.skipped++;
          continue;
        }

        // Fetch detailed field data for this center
        const fields = await fetcher.fetchCenterFields(parseInt(center.nid));

        // Extract address information
        const address = fields.address || {};
        const city = fields.city || address.field_address_locality || '';
        const country = address.field_address_country || '';
        const state = address.field_address_administrative_area || '';
        const street = address.field_address_thoroughfare || '';
        const postalCode = address.field_address_postal_code || '';

        // Extract coordinates
        const location = fields.location || {};
        const latitude = location.field_location_lat ? parseFloat(location.field_location_lat) : undefined;
        const longitude = location.field_location_lng ? parseFloat(location.field_location_lng) : undefined;

        // Determine if center should be featured (based on rating)
        const featured = fields.rating && fields.rating >= 4.0;

        // Find the real owner from Drupal
        let owner = adminUser._id; // Default fallback
        try {
          const drupalOwnerUid = parseInt(center.uid);
          if (drupalOwnerUid > 0) {
            // Fetch the email for this Drupal user
            const ownerEmail = await fetcher.fetchUserEmail(drupalOwnerUid);
            if (ownerEmail) {
              // Find matching user in MongoDB
              const mongoUser = await User.findOne({ email: ownerEmail });
              if (mongoUser) {
                owner = mongoUser._id;
              }
            }
          }
        } catch (error: any) {
          // If owner lookup fails, fallback to admin (already set)
          console.log(`  ⚠️  Could not find owner for ${center.title}, using admin`);
        }

        // Build company data
        const companyData: any = {
          name: center.title,
          description: fields.body || '',
          address: {
            street: street || undefined,
            city: city || undefined,
            state: state || undefined,
            postalCode: postalCode || undefined,
            country: country || undefined,
          },
          website: fields.website || undefined,
          contact: {
            email: fields.email || undefined,
          },
          offeredActivities: fields.activities || [],
          offeredServices: fields.offerings || [],
          featured: featured || false,
          owner: owner,
          createdAt: created,
          updatedAt: new Date(parseInt(center.changed) * 1000),
        };

        // Add coordinates if available
        if (latitude && longitude && !isNaN(latitude) && !isNaN(longitude)) {
          companyData.coordinates = {
            latitude,
            longitude,
          };
        }

        // Add logo if available (will need to be migrated separately)
        if (fields.logo) {
          companyData.logo = fields.logo; // Store Drupal path for now
        }

        // Add pictures if available (max 3 for Company model)
        if (fields.pictures && fields.pictures.length > 0) {
          companyData.pictures = fields.pictures.slice(0, 3); // Take first 3
        }

        // Create the company/center
        await Company.create(companyData);
        stats.migrated++;
        console.log(`${index + 1}/${centers.length} ✅ Migrated: ${center.title} (${dateStr})`);

      } catch (error: any) {
        console.error(`${index + 1}/${centers.length} ❌ Error: ${center.title} - ${error.message}`);
        stats.errors++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log('═══════════════════════════════');
    console.log(`Migrated: ${stats.migrated}`);
    console.log(`Skipped:  ${stats.skipped}`);
    console.log(`Errors:   ${stats.errors}`);

    // Final count
    const totalCompanies = await Company.countDocuments();
    console.log(`\nTotal companies in MongoDB: ${totalCompanies}`);

    // Count by type
    const centersCount = await Company.countDocuments({ offeredActivities: { $exists: true, $ne: [] } });
    const jobCompaniesCount = totalCompanies - centersCount;
    console.log(`  - Kitesurf centers: ${centersCount}`);
    console.log(`  - Job companies: ${jobCompaniesCount}`);

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');

    console.log('\n📝 Next Steps:');
    console.log('  1. Run image migration to download center pictures');
    console.log('  2. Verify center data in the application');
    console.log('  3. Update center ownership if needed');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

migrateKitesurfCenters();
