import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Job from '@/models/Job';
import Company from '@/models/Company';
import { requireAuth, requireRole } from '@/lib/auth';
import mongoose from 'mongoose';

// GET - Get all jobs (accessible to all users, including anonymous)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Debug: Log registered models to help diagnose population issues
    const registeredModels = Object.keys(mongoose.models);
    console.log('[Jobs API] GET - Registered models:', registeredModels);

    // Get only published jobs (unpublished jobs are hidden from public)
    // Include jobs where published is true OR undefined (default is true)
    // Exclude only jobs where published is explicitly false
    const jobs = await Job.find({ 
      $or: [
        { published: true },
        { published: { $exists: false } }
      ]
    })
      .populate('recruiter', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ jobs }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new job (recruiters only)
export async function POST(request: NextRequest) {
  try {
    const user = requireRole(request, ['recruiter']);
    await connectDB();

    // Check if recruiter has a company
    const company = await Company.findOne({ owner: user.userId });
    if (!company) {
      return NextResponse.json(
        { error: 'You must create a company profile before posting jobs' },
        { status: 400 }
      );
    }

    const { title, description, location, country, salary, type, languages, qualifications, sports, occupationalAreas, pictures, applyByEmail, applyByWebsite, applicationEmail, applicationWebsite } = await request.json();

    if (!title || !description || !location || !type) {
      return NextResponse.json(
        { error: 'Title, description, location, and type are required' },
        { status: 400 }
      );
    }

    // Validate pictures array (max 3)
    if (pictures && Array.isArray(pictures) && pictures.length > 3) {
      return NextResponse.json(
        { error: 'Maximum 3 pictures allowed' },
        { status: 400 }
      );
    }

    // Normalize country: trim and uppercase, or set to null if empty (null explicitly stores the field)
    const normalizedCountry = country?.trim() ? country.trim().toUpperCase() : null;
    
    const job = await Job.create({
      title,
      description,
      company: company.name,
      companyId: company._id,
      location,
      country: normalizedCountry,
      salary,
      type,
      languages: languages || [],
      qualifications: qualifications || [],
      sports: sports || [],
      occupationalAreas: occupationalAreas || [],
      pictures: pictures || [],
      applyByEmail: applyByEmail || false,
      applyByWebsite: applyByWebsite || false,
      applicationEmail: applicationEmail || undefined,
      applicationWebsite: applicationWebsite || undefined,
      recruiter: user.userId,
      published: true, // New jobs are published by default
    });

    const populatedJob = await Job.findById(job._id).populate('recruiter', 'name email');
    
    // Convert to plain object and ensure all fields are included, including country
    const jobObject = populatedJob?.toObject();
    const jobResponse = jobObject ? {
      ...jobObject,
      // Handle country field - normalize if it exists, preserve null if explicitly set
      country: jobObject.country != null 
        ? (jobObject.country.trim() ? jobObject.country.trim().toUpperCase() : null)
        : undefined,
    } : populatedJob;

    return NextResponse.json(
      { message: 'Job created successfully', job: jobResponse },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

