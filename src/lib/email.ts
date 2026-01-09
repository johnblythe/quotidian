/**
 * Email service using Resend
 *
 * Requires RESEND_API_KEY environment variable to be set.
 * Get your API key from https://resend.com
 */

import { Resend } from 'resend';

let resendClient: Resend | null = null;

/**
 * Check if Resend is configured (API key is set)
 */
export function isResendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

/**
 * Get the Resend client instance (lazy initialization)
 * Returns null if not configured
 */
function getResend(): Resend | null {
  if (!isResendConfigured()) {
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }

  return resendClient;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Send an email using Resend
 *
 * @param options - Email options (to, subject, html, etc.)
 * @returns Result with success status and email ID or error
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const resend = getResend();

  if (!resend) {
    return {
      success: false,
      error: 'Resend not configured. Set RESEND_API_KEY environment variable.',
    };
  }

  const { to, subject, html, text, from, replyTo } = options;

  try {
    const { data, error } = await resend.emails.send({
      from: from ?? 'Quotidian <onboarding@resend.dev>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      replyTo,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      id: data?.id,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error sending email';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Send a test email to verify Resend configuration
 */
export async function sendTestEmail(to: string): Promise<SendEmailResult> {
  return sendEmail({
    to,
    subject: 'Quotidian - Test Email',
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #3d3d3d; font-size: 24px; margin-bottom: 20px;">
          Quotidian Email Test
        </h1>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          If you're reading this, your Resend integration is working correctly!
        </p>
        <p style="color: #999; font-size: 14px; margin-top: 30px;">
          — The Quotidian App
        </p>
      </div>
    `,
    text: 'Quotidian Email Test\n\nIf you\'re reading this, your Resend integration is working correctly!\n\n— The Quotidian App',
  });
}
