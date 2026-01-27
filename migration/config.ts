/**
 * Migration Configuration
 *
 * This file contains configuration for the Drupal → MongoDB migration
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

export const MIGRATION_CONFIG = {
  // SSH connection to Drupal server
  drupal: {
    host: 'ssh.chickenloop.com',
    port: 18765,
    user: 'u44-lsefuz8uidbg',
    siteRoot: 'www/chickenloop.com/public_html',
    drushPath: '/usr/local/bin/drush.phar',
  },

  // MongoDB connection
  mongodb: {
    uri: process.env.MONGODB_URI || '',
    database: 'chickenloop',
  },

  // Backup settings
  backup: {
    enabled: true,
    path: './migration/backups',
  },

  // Migration settings
  batchSize: 100,
  verbose: true,

  // ID mapping (Drupal UID → MongoDB ObjectId)
  mappings: {
    users: new Map<number, string>(),
    nodes: new Map<number, string>(),
    profiles: new Map<number, string>(),
  }
};

// Job categories mapping (from Drupal taxonomy to Next.js enum)
export const JOB_CATEGORIES = [
  'Kitesurfing Instructor',
  'Windsurfing Instructor',
  'SUP Instructor',
  'Sailing Instructor',
  'Surf Instructor',
  'Yoga Instructor',
  'Fitness Trainer',
  'Hospitality',
  'Management',
  'Marketing',
  'Sales',
  'IT',
  'Administration',
  'Other'
] as const;

// Taxonomy vocabulary mapping
export const TAXONOMY_MAPPING = {
  occupational_fields: JOB_CATEGORIES,
  employment_type: ['full-time', 'part-time', 'contract', 'freelance'],
  years_of_experience: ['entry', 'intermediate', 'experienced', 'senior'],
  career_status: ['active', 'passive', 'not-looking'],
};
