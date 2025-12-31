/**
 * Email templates for ATS (Applicant Tracking System) events
 */

export interface ApplicationEmailData {
  candidateName: string;
  candidateEmail: string;
  recruiterName: string;
  recruiterEmail: string;
  jobTitle?: string;
  jobCompany?: string;
  jobLocation?: string;
  status?: string;
  applicationDate?: Date;
}

/**
 * Email: Candidate applied to job
 * Sent to: Recruiter
 */
export function getCandidateAppliedEmail(data: ApplicationEmailData): { subject: string; html: string; text: string } {
  const { candidateName, candidateEmail, jobTitle, jobCompany, jobLocation, applicationDate } = data;
  
  const dateStr = applicationDate ? new Date(applicationDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : 'recently';

  const subject = `New Application: ${candidateName} applied for ${jobTitle || 'your job posting'}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2563eb; margin-bottom: 20px;">New Job Application</h2>
      
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0 0 10px 0;"><strong>Candidate:</strong> ${candidateName}</p>
        <p style="margin: 0 0 10px 0;"><strong>Email:</strong> <a href="mailto:${candidateEmail}" style="color: #2563eb; text-decoration: none;">${candidateEmail}</a></p>
        <p style="margin: 0;"><strong>Applied:</strong> ${dateStr}</p>
      </div>

      ${jobTitle ? `
        <div style="background-color: #ffffff; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #374151; margin-top: 0;">Job Details</h3>
          <p style="margin: 5px 0;"><strong>Position:</strong> ${jobTitle}</p>
          ${jobCompany ? `<p style="margin: 5px 0;"><strong>Company:</strong> ${jobCompany}</p>` : ''}
          ${jobLocation ? `<p style="margin: 5px 0;"><strong>Location:</strong> ${jobLocation}</p>` : ''}
        </div>
      ` : ''}

      <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb;">
        <p style="margin: 0; color: #1e40af;">
          <strong>Next Steps:</strong> Review this application in your dashboard and update the status as you progress through your hiring process.
        </p>
      </div>
    </div>
  `;

  const text = `New Job Application

Candidate: ${candidateName}
Email: ${candidateEmail}
Applied: ${dateStr}

${jobTitle ? `Job Details:
Position: ${jobTitle}
${jobCompany ? `Company: ${jobCompany}\n` : ''}${jobLocation ? `Location: ${jobLocation}\n` : ''}` : ''}

Next Steps: Review this application in your dashboard and update the status as you progress through your hiring process.`;

  return { subject, html, text };
}

/**
 * Email: Recruiter contacted candidate
 * Sent to: Candidate
 */
export function getRecruiterContactedEmail(data: ApplicationEmailData): { subject: string; html: string; text: string } {
  const { recruiterName, recruiterEmail, jobTitle, jobCompany, jobLocation } = data;

  const subject = jobTitle 
    ? `${recruiterName} from ${jobCompany || 'a company'} is interested in your profile`
    : `${recruiterName} is interested in your profile`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2563eb; margin-bottom: 20px;">New Contact from Recruiter</h2>
      
      <p>Hello,</p>
      
      <p><strong>${recruiterName}</strong> has reached out to you through Chickenloop.</p>

      ${jobTitle ? `
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Position of Interest</h3>
          <p style="margin: 5px 0;"><strong>Position:</strong> ${jobTitle}</p>
          ${jobCompany ? `<p style="margin: 5px 0;"><strong>Company:</strong> ${jobCompany}</p>` : ''}
          ${jobLocation ? `<p style="margin: 5px 0;"><strong>Location:</strong> ${jobLocation}</p>` : ''}
        </div>
      ` : ''}

      <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 20px 0;">
        <p style="margin: 0; color: #1e40af;">
          <strong>What's Next?</strong> The recruiter may contact you directly to discuss opportunities. Keep an eye on your email and the Chickenloop platform for updates.
        </p>
      </div>

      <p style="margin-top: 20px;">
        You can contact the recruiter at: <a href="mailto:${recruiterEmail}" style="color: #2563eb; text-decoration: none;">${recruiterEmail}</a>
      </p>
    </div>
  `;

  const text = `New Contact from Recruiter

Hello,

${recruiterName} has reached out to you through Chickenloop.

${jobTitle ? `Position of Interest:
Position: ${jobTitle}
${jobCompany ? `Company: ${jobCompany}\n` : ''}${jobLocation ? `Location: ${jobLocation}\n` : ''}` : ''}

What's Next? The recruiter may contact you directly to discuss opportunities. Keep an eye on your email and the Chickenloop platform for updates.

You can contact the recruiter at: ${recruiterEmail}`;

  return { subject, html, text };
}

/**
 * Email: Application status changed
 * Sent to: Candidate
 */
export function getStatusChangedEmail(data: ApplicationEmailData): { subject: string; html: string; text: string } {
  const { recruiterName, jobTitle, jobCompany, status } = data;

  const statusLabels: Record<string, string> = {
    new: 'New Application',
    contacted: 'Contacted',
    interviewed: 'Interview Scheduled',
    offered: 'Offer Extended',
    rejected: 'Not Selected',
    withdrawn: 'Application Withdrawn',
  };

  const statusLabel = statusLabels[status || 'new'] || status || 'Updated';

  const statusColors: Record<string, string> = {
    new: '#3b82f6',
    contacted: '#8b5cf6',
    interviewed: '#f59e0b',
    offered: '#10b981',
    rejected: '#ef4444',
    withdrawn: '#6b7280',
  };

  const statusColor = statusColors[status || 'new'] || '#6b7280';

  const subject = `Application Update: ${statusLabel}${jobTitle ? ` - ${jobTitle}` : ''}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2563eb; margin-bottom: 20px;">Application Status Update</h2>
      
      <p>Hello,</p>
      
      <p>The status of your application has been updated.</p>

      ${jobTitle ? `
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Job Details</h3>
          <p style="margin: 5px 0;"><strong>Position:</strong> ${jobTitle}</p>
          ${jobCompany ? `<p style="margin: 5px 0;"><strong>Company:</strong> ${jobCompany}</p>` : ''}
        </div>
      ` : ''}

      <div style="background-color: ${statusColor}15; padding: 15px; border-radius: 8px; border-left: 4px solid ${statusColor}; margin: 20px 0;">
        <p style="margin: 0;">
          <strong style="color: ${statusColor};">New Status: ${statusLabel}</strong>
        </p>
      </div>

      ${status === 'offered' ? `
        <div style="background-color: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #065f46;">
            <strong>🎉 Congratulations!</strong> You've received an offer. The recruiter will contact you with details.
          </p>
        </div>
      ` : ''}

      ${status === 'rejected' ? `
        <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #991b1b;">
            Thank you for your interest. While this position didn't work out, we encourage you to keep applying to other opportunities on Chickenloop.
          </p>
        </div>
      ` : ''}
      ${status === 'withdrawn' ? `
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #374151;">
            Your application has been withdrawn. If you have any questions, please contact the recruiter.
          </p>
        </div>
      ` : ''}

      <p style="margin-top: 20px;">
        ${recruiterName ? `Recruiter: ${recruiterName}` : 'You can view all your applications in your Chickenloop dashboard.'}
      </p>
    </div>
  `;

  const text = `Application Status Update

Hello,

The status of your application has been updated.

${jobTitle ? `Job Details:
Position: ${jobTitle}
${jobCompany ? `Company: ${jobCompany}\n` : ''}` : ''}

New Status: ${statusLabel}

${status === 'offered' ? '🎉 Congratulations! You\'ve received an offer. The recruiter will contact you with details.\n' : ''}
${status === 'rejected' ? 'Thank you for your interest. While this position didn\'t work out, we encourage you to keep applying to other opportunities on Chickenloop.\n' : ''}
${status === 'withdrawn' ? 'Your application has been withdrawn. If you have any questions, please contact the recruiter.\n' : ''}
${recruiterName ? `Recruiter: ${recruiterName}` : 'You can view all your applications in your Chickenloop dashboard.'}`;

  return { subject, html, text };
}

/**
 * Email: Job search alert
 * Sent to: Job seeker with matching jobs
 */
export interface JobAlertEmailData {
  userName: string;
  userEmail: string;
  searchName?: string;
  jobs: Array<{
    _id: string;
    title: string;
    company: string;
    location: string;
    country?: string;
    description: string;
    type: string;
    featured?: boolean;
    createdAt: Date;
    url?: string;
  }>;
  frequency: 'daily' | 'weekly';
}

export function getJobAlertEmail(data: JobAlertEmailData): { subject: string; html: string; text: string } {
  const { userName, searchName, jobs, frequency } = data;
  
  const jobCount = jobs.length;
  const frequencyText = frequency === 'daily' ? 'daily' : 'weekly';
  
  const subject = searchName
    ? `New Jobs Matching "${searchName}" - ${jobCount} ${jobCount === 1 ? 'job' : 'jobs'} found`
    : `New Jobs Matching Your Search - ${jobCount} ${jobCount === 1 ? 'job' : 'jobs'} found`;

  const jobsHtml = jobs.map((job) => {
    const jobUrl = job.url || `https://chickenloop.com/jobs/${job._id}`;
    const dateStr = new Date(job.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    
    return `
      <div style="background-color: ${job.featured ? '#fef3c7' : '#ffffff'}; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 15px; ${job.featured ? 'border-left: 4px solid #f59e0b;' : ''}">
        ${job.featured ? '<div style="background-color: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px; display: inline-block; font-size: 12px; font-weight: bold; margin-bottom: 10px;">⭐ Featured</div>' : ''}
        <h3 style="margin: 0 0 10px 0; color: #1f2937;">
          <a href="${jobUrl}" style="color: #2563eb; text-decoration: none; font-size: 18px;">${job.title}</a>
        </h3>
        <p style="margin: 5px 0; color: #4b5563; font-weight: 600;">${job.company}</p>
        <p style="margin: 5px 0; color: #6b7280;">
          📍 ${job.location}${job.country ? `, ${job.country}` : ''}
        </p>
        <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
          💼 ${job.type.charAt(0).toUpperCase() + job.type.slice(1)} • Posted ${dateStr}
        </p>
        <p style="margin: 10px 0 0 0; color: #374151; line-height: 1.5;">
          ${job.description.substring(0, 200)}${job.description.length > 200 ? '...' : ''}
        </p>
        <a href="${jobUrl}" style="display: inline-block; margin-top: 10px; padding: 8px 16px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">View Job</a>
      </div>
    `;
  }).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2563eb; margin-bottom: 20px;">New Jobs Matching Your Search</h2>
      
      <p>Hello ${userName},</p>
      
      <p>We found <strong>${jobCount} new ${jobCount === 1 ? 'job' : 'jobs'}</strong> that match your saved search${searchName ? ` "${searchName}"` : ''}.</p>

      ${jobCount > 0 ? `
        <div style="margin: 20px 0;">
          ${jobsHtml}
        </div>
      ` : `
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #6b7280;">No new jobs found this ${frequencyText}. We'll keep checking and notify you when new matches are available!</p>
        </div>
      `}

      <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 20px 0;">
        <p style="margin: 0; color: #1e40af; font-size: 14px;">
          <strong>Tip:</strong> You can manage your saved searches and adjust your preferences in your Chickenloop dashboard.
        </p>
      </div>

      <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
        This is a ${frequencyText} job alert. You're receiving this because you have an active saved search on Chickenloop.
      </p>
    </div>
  `;

  const text = `New Jobs Matching Your Search

Hello ${userName},

We found ${jobCount} new ${jobCount === 1 ? 'job' : 'jobs'} that match your saved search${searchName ? ` "${searchName}"` : ''}.

${jobs.length > 0 ? jobs.map((job) => {
    const jobUrl = job.url || `https://chickenloop.com/jobs/${job._id}`;
    const dateStr = new Date(job.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    return `
${job.featured ? '⭐ FEATURED\n' : ''}${job.title}
${job.company}
📍 ${job.location}${job.country ? `, ${job.country}` : ''}
💼 ${job.type.charAt(0).toUpperCase() + job.type.slice(1)} • Posted ${dateStr}

${job.description.substring(0, 200)}${job.description.length > 200 ? '...' : ''}

View Job: ${jobUrl}
`;
  }).join('\n---\n') : `No new jobs found this ${frequencyText}. We'll keep checking and notify you when new matches are available!`}

Tip: You can manage your saved searches and adjust your preferences in your Chickenloop dashboard.

This is a ${frequencyText} job alert. You're receiving this because you have an active saved search on Chickenloop.`;

  return { subject, html, text };
}

/**
 * Email: Application withdrawn by candidate
 * Sent to: Recruiter
 */
export function getApplicationWithdrawnEmail(data: ApplicationEmailData): { subject: string; html: string; text: string } {
  const { candidateName, candidateEmail, recruiterName, jobTitle, jobCompany, jobLocation } = data;

  const subject = `Application Withdrawn: ${candidateName} withdrew from ${jobTitle || 'your job posting'}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #6b7280; margin-bottom: 20px;">Application Withdrawn</h2>
      
      <p>Hello ${recruiterName},</p>
      
      <p>A candidate has withdrawn their application.</p>

      <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0;"><strong>Candidate:</strong> ${candidateName}</p>
        <p style="margin: 0 0 10px 0;"><strong>Email:</strong> <a href="mailto:${candidateEmail}" style="color: #2563eb; text-decoration: none;">${candidateEmail}</a></p>
      </div>

      ${jobTitle ? `
        <div style="background-color: #ffffff; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Job Details</h3>
          <p style="margin: 5px 0;"><strong>Position:</strong> ${jobTitle}</p>
          ${jobCompany ? `<p style="margin: 5px 0;"><strong>Company:</strong> ${jobCompany}</p>` : ''}
          ${jobLocation ? `<p style="margin: 5px 0;"><strong>Location:</strong> ${jobLocation}</p>` : ''}
        </div>
      ` : ''}

      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; border-left: 4px solid #6b7280; margin: 20px 0;">
        <p style="margin: 0; color: #374151;">
          <strong>Status: Application Withdrawn</strong>
        </p>
      </div>

      <p style="margin-top: 20px;">
        You can view all applications in your Chickenloop recruiter dashboard.
      </p>
    </div>
  `;

  const text = `Application Withdrawn

Hello ${recruiterName},

A candidate has withdrawn their application.

Candidate: ${candidateName}
Email: ${candidateEmail}

${jobTitle ? `Job Details:
Position: ${jobTitle}
${jobCompany ? `Company: ${jobCompany}\n` : ''}${jobLocation ? `Location: ${jobLocation}\n` : ''}` : ''}

Status: Application Withdrawn

You can view all applications in your Chickenloop recruiter dashboard.`;

  return { subject, html, text };
}

