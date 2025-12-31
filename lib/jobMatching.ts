/**
 * Job matching logic for saved searches
 * Replicates the frontend filtering logic
 */

import mongoose from 'mongoose';
import Job, { IJob } from '@/models/Job';
import { ISavedSearch } from '@/models/SavedSearch';

interface PopulatedJob extends Omit<IJob, 'recruiter'> {
  recruiter?: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
  };
}

export interface JobMatch {
  job: PopulatedJob;
  matchReasons: string[];
}

/**
 * Match jobs against a saved search criteria
 */
export async function findMatchingJobs(
  savedSearch: ISavedSearch,
  sinceDate?: Date
): Promise<JobMatch[]> {
  // Build query for published jobs
  // Note: Database connection should be established by the caller
  interface JobQuery {
    published: { $ne: boolean };
    createdAt?: { $gte: Date };
  }
  
  const query: JobQuery = {
    published: { $ne: false }, // Exclude only explicitly unpublished jobs
  };

  // Filter by creation date if provided (for alerts)
  if (sinceDate) {
    query.createdAt = { $gte: sinceDate };
  }

  // Fetch all jobs that might match
  // Use explicit typing to avoid TypeScript issues with lean()
  const jobs = await Job.find(query)
    .populate('recruiter', 'name email')
    .sort({ createdAt: -1 })
    .lean() as unknown as PopulatedJob[];
  
  // Ensure we have an array
  const jobsArray = Array.isArray(jobs) ? jobs : [];

  // Apply filters (matching frontend logic)
  const matches: JobMatch[] = [];

  for (const job of jobsArray) {
    const matchReasons: string[] = [];
    let jobMatches = true;

    // Filter by keyword (searches in title, description, company)
    if (savedSearch.keyword) {
      const keywordLower = savedSearch.keyword.toLowerCase();
      const titleMatch = job.title?.toLowerCase().includes(keywordLower);
      const descriptionMatch = job.description?.toLowerCase().includes(keywordLower);
      const companyMatch = job.company?.toLowerCase().includes(keywordLower);
      
      if (!titleMatch && !descriptionMatch && !companyMatch) {
        jobMatches = false;
      } else {
        if (titleMatch) matchReasons.push(`Title contains "${savedSearch.keyword}"`);
        if (companyMatch) matchReasons.push(`Company contains "${savedSearch.keyword}"`);
      }
    }

    // Filter by location
    if (jobMatches && savedSearch.location) {
      const locationLower = savedSearch.location.toLowerCase();
      if (!job.location?.toLowerCase().includes(locationLower)) {
        jobMatches = false;
      } else {
        matchReasons.push(`Location: ${job.location}`);
      }
    }

    // Filter by country
    if (jobMatches && savedSearch.country) {
      if (!job.country || job.country.toUpperCase() !== savedSearch.country.toUpperCase()) {
        jobMatches = false;
      } else {
        matchReasons.push(`Country: ${job.country}`);
      }
    }

    // Filter by category (occupationalAreas)
    if (jobMatches && savedSearch.category) {
      if (!job.occupationalAreas || !job.occupationalAreas.includes(savedSearch.category)) {
        jobMatches = false;
      } else {
        matchReasons.push(`Category: ${savedSearch.category}`);
      }
    }

    // Filter by sport
    if (jobMatches && savedSearch.sport) {
      if (!job.sports || !job.sports.includes(savedSearch.sport)) {
        jobMatches = false;
      } else {
        matchReasons.push(`Sport: ${savedSearch.sport}`);
      }
    }

    // Filter by language
    if (jobMatches && savedSearch.language) {
      if (!job.languages || !job.languages.includes(savedSearch.language)) {
        jobMatches = false;
      } else {
        matchReasons.push(`Language: ${savedSearch.language}`);
      }
    }

    if (jobMatches) {
      matches.push({ job, matchReasons });
    }
  }

  // Sort: featured first, then by creation date descending
  matches.sort((a, b) => {
    const aFeatured = Boolean(a.job.featured);
    const bFeatured = Boolean(b.job.featured);
    
    if (aFeatured && !bFeatured) return -1;
    if (!aFeatured && bFeatured) return 1;
    
    const dateA = new Date(a.job.createdAt || 0).getTime();
    const dateB = new Date(b.job.createdAt || 0).getTime();
    return dateB - dateA;
  });

  return matches;
}

