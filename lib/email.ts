import { Resend } from 'resend';

// Initialize Resend client
let resend: Resend | null = null;

/**
 * Get or initialize Resend client
 */
function getResendClient(): Resend | null {
  if (resend) {
    return resend;
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn('RESEND_API_KEY is not set. Email functionality will be disabled.');
    return null;
  }

  // Validate API key format (should start with 're_')
  if (!apiKey.startsWith('re_')) {
    console.error('RESEND_API_KEY appears to be invalid (should start with "re_")');
    return null;
  }

  resend = new Resend(apiKey);
  return resend;
}

/**
 * Get the default from email address
 */
function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
}

/**
 * Send a transactional email using Resend
 */
export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  tags?: Array<{ name: string; value: string }>;
}

export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const client = getResendClient();
    if (!client) {
      return {
        success: false,
        error: 'Email service is not configured. Please set RESEND_API_KEY in your environment variables.',
      };
    }

    const { to, subject, html, text, from, replyTo, cc, bcc, tags } = options;

    // Ensure we have either html or text content
    if (!html && !text) {
      return {
        success: false,
        error: 'Either html or text content is required.',
      };
    }

    // Build email payload - Resend requires at least one of html or text
    const emailPayload: {
      from: string;
      to: string[];
      subject: string;
      html?: string;
      text?: string;
      replyTo?: string;
      cc?: string[];
      bcc?: string[];
      tags?: Array<{ name: string; value: string }>;
    } = {
      from: from || getFromEmail(),
      to: Array.isArray(to) ? to : [to],
      subject,
    };

    // Add html or text (at least one is required)
    if (html) {
      emailPayload.html = html;
    }
    if (text) {
      emailPayload.text = text;
    }

    // Add optional fields
    if (replyTo) {
      emailPayload.replyTo = replyTo;
    }

    if (cc) {
      emailPayload.cc = Array.isArray(cc) ? cc : [cc];
    }

    if (bcc) {
      emailPayload.bcc = Array.isArray(bcc) ? bcc : [bcc];
    }

    if (tags) {
      emailPayload.tags = tags;
    }

    const result = await client.emails.send(emailPayload as Parameters<typeof client.emails.send>[0]);

    if (result.error) {
      console.error('Resend API error:', result.error);
      return {
        success: false,
        error: result.error.message || 'Failed to send email',
      };
    }

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending email:', error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send a test email to verify email configuration
 */
export async function sendTestEmail(to: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  return sendEmail({
    to,
    subject: 'Test Email from Chickenloop',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Test Email</h2>
        <p>This is a test email from the Chickenloop platform.</p>
        <p>If you received this email, your email configuration is working correctly!</p>
        <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 12px;">
          Sent at: ${new Date().toLocaleString()}<br />
          From: ${getFromEmail()}
        </p>
      </div>
    `,
    text: `Test Email\n\nThis is a test email from the Chickenloop platform.\n\nIf you received this email, your email configuration is working correctly!\n\nSent at: ${new Date().toLocaleString()}\nFrom: ${getFromEmail()}`,
  });
}

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

