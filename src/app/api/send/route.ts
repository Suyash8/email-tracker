import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, subject, htmlContent, recipients, smtpSettings } = body;

    if (!title || !subject || !htmlContent || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Title, subject, HTML content, and recipients are required' },
        { status: 400 }
      );
    }

    // Process recipients
    const formattedRecipients = recipients
      .map((r: string | { email: string; name?: string }) => {
        if (typeof r === 'string') {
          return { email: r.trim(), name: null };
        }
        return { email: r.email.trim(), name: r.name || null };
      })
      .filter((r) => r.email.length > 0);

    // Create tracker and recipient database records
    const tracker = await db.tracker.create({
      data: {
        title,
        subject,
        bodySnippet: htmlContent.replace(/<[^>]*>?/gm, '').substring(0, 100),
        recipients: {
          create: formattedRecipients,
        },
      },
      include: {
        recipients: true,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Optional nodemailer transport configuration
    let transporter: nodemailer.Transporter | null = null;

    if (smtpSettings?.host && smtpSettings?.user && smtpSettings?.pass) {
      transporter = nodemailer.createTransport({
        host: smtpSettings.host,
        port: Number(smtpSettings.port) || 587,
        secure: Number(smtpSettings.port) === 465,
        auth: {
          user: smtpSettings.user,
          pass: smtpSettings.pass,
        },
      });
    }

    const sendResults = [];

    for (const recipient of tracker.recipients) {
      // Recipient-specific stealth pixel HTML
      const trackingPixelHtml = `<img src="${appUrl}/api/track/pixel?t=${recipient.token}" width="1" height="1" border="0" style="display:none !important; width:1px; height:1px; border:0; outline:none; text-decoration:none;" alt="" />`;

      // Inject pixel before </body> or at the end of HTML
      let finalHtml = htmlContent;
      if (finalHtml.includes('</body>')) {
        finalHtml = finalHtml.replace('</body>', `${trackingPixelHtml}</body>`);
      } else {
        finalHtml += trackingPixelHtml;
      }

      if (transporter) {
        try {
          const info = await transporter.sendMail({
            from: smtpSettings.from || smtpSettings.user,
            to: recipient.email,
            subject,
            html: finalHtml,
          });
          sendResults.push({ email: recipient.email, status: 'sent', messageId: info.messageId });
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          sendResults.push({ email: recipient.email, status: 'error', error: errorMessage });
        }
      } else {
        // Simulated / Prepared dispatch (Pixel generated ready for external send)
        sendResults.push({ email: recipient.email, status: 'prepared', token: recipient.token });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        tracker,
        sendResults,
        smtpConfigured: !!transporter,
      },
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    return NextResponse.json({ success: false, error: 'Failed to process email dispatch' }, { status: 500 });
  }
}
