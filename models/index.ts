/**
 * Models Index
 * 
 * This file imports and exports all Mongoose models to ensure they are 
 * properly registered before being used. This is especially important
 * in serverless environments (like Vercel) where modules may be loaded
 * independently for each function.
 * 
 * Always import models from this file to ensure all models are registered:
 * import { User, Job, Company, CV, AuditLog } from '@/models';
 */

import User, { IUser } from './User';
import Job, { IJob } from './Job';
import Company, { ICompany } from './Company';
import CV, { ICV } from './CV';
import AuditLog, { IAuditLog } from './AuditLog';

// Log model registration in development for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('[Models] Registering models:', {
    User: !!User,
    Job: !!Job,
    Company: !!Company,
    CV: !!CV,
    AuditLog: !!AuditLog,
  });
}

// Export all models
export { User, Job, Company, CV, AuditLog };

// Export all interfaces
export type { IUser, IJob, ICompany, ICV, IAuditLog };

// Default export for convenience
export default {
  User,
  Job,
  Company,
  CV,
  AuditLog,
};
