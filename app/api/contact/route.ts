import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// POST - Send contact/feedback email
export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const contactTo = process.env.CONTACT_TO || 'hello@chickenloop.com';

    // Check if SMTP is configured
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || smtpUser || 'noreply@chickenloop.com';

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      // Log the submission for manual processing if SMTP is not configured
      console.log('Contact Form Submission (SMTP not configured):', {
        to: contactTo,
        from: email,
        name,
        message,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        { 
          error: `Email service is not configured. Please contact support directly at ${contactTo}`,
          fallback: true 
        },
        { status: 503 }
      );
    }

    const port = Number.parseInt(smtpPort, 10);
    if (!Number.isFinite(port) || port <= 0) {
      return NextResponse.json(
        { error: 'Email service is misconfigured (invalid SMTP_PORT).' },
        { status: 500 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port,
      secure: port === 465, // true for 465, false for other ports (e.g. Proton Bridge uses 1025)
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Send email
    await transporter.sendMail({
      from: smtpFrom,
      to: contactTo,
      replyTo: email,
      subject: `Feedback from ${name}`,
      text: `From: ${name} (${email})\n\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Feedback Submission</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
            <p style="white-space: pre-wrap; margin: 0;">${message.replace(/\n/g, '<br>')}</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json(
      { message: 'Thank you for your feedback! We will get back to you soon.' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
}

