/**
 * Resend Email Utility
 *
 * Provides email sending functionality using Resend API.
 * Handles contact form and demo request notifications.
 *
 * @module api/utils/resend
 */

import { Resend } from 'resend';

/**
 * Get Resend client instance
 *
 * @returns {Resend} Configured Resend client
 * @throws {Error} If RESEND_API_KEY is not set
 */
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }

  return new Resend(apiKey);
}

/**
 * Send contact form notification email
 *
 * Sends an email notification when someone submits the contact form.
 *
 * @param {Object} contactData - Contact form data
 * @param {string} contactData.name - Contact name
 * @param {string} contactData.email - Contact email
 * @param {string} [contactData.company] - Company name
 * @param {string} [contactData.phone] - Phone number
 * @param {string} contactData.message - Message content
 * @param {Object} options - Email options
 * @param {string} [options.toEmail] - Recipient email (defaults to CONTACT_EMAIL env var)
 * @param {string} [options.fromEmail] - Sender email (defaults to noreply@tcdynamics.fr)
 * @returns {Promise<Object>} Resend API response
 * @throws {Error} If email sending fails
 */
export async function sendContactFormEmail(contactData, options = {}) {
  const resend = getResendClient();

  const toEmail = options.toEmail || process.env.CONTACT_EMAIL || 'tom.coustols@tcdynamics.fr';
  const fromEmail = options.fromEmail || 'noreply@tcdynamics.fr';

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: #f9f9f9;
      border-radius: 8px;
      padding: 30px;
      border: 1px solid #e0e0e0;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
      margin: -30px -30px 20px -30px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .field {
      margin-bottom: 20px;
    }
    .field-label {
      font-weight: 600;
      color: #555;
      margin-bottom: 5px;
    }
    .field-value {
      background: white;
      padding: 10px;
      border-radius: 4px;
      border: 1px solid #e0e0e0;
    }
    .message-box {
      background: white;
      padding: 15px;
      border-radius: 4px;
      border-left: 4px solid #667eea;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      color: #888;
      font-size: 12px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📧 New Contact Form Submission</h1>
    </div>

    <div class="field">
      <div class="field-label">👤 Name:</div>
      <div class="field-value">${contactData.name}</div>
    </div>

    <div class="field">
      <div class="field-label">📧 Email:</div>
      <div class="field-value"><a href="mailto:${contactData.email}">${contactData.email}</a></div>
    </div>

    ${contactData.company ? `
    <div class="field">
      <div class="field-label">🏢 Company:</div>
      <div class="field-value">${contactData.company}</div>
    </div>
    ` : ''}

    ${contactData.phone ? `
    <div class="field">
      <div class="field-label">📞 Phone:</div>
      <div class="field-value"><a href="tel:${contactData.phone}">${contactData.phone}</a></div>
    </div>
    ` : ''}

    <div class="field">
      <div class="field-label">💬 Message:</div>
      <div class="message-box">${contactData.message}</div>
    </div>

    <div class="footer">
      Sent via TC Dynamics Contact Form<br>
      ${new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris' })} (Paris Time)
    </div>
  </div>
</body>
</html>
  `;

  try {
    const response = await resend.emails.send({
      from: `TC Dynamics Contact Form <${fromEmail}>`,
      to: toEmail,
      subject: `New Contact: ${contactData.name}${contactData.company ? ` from ${contactData.company}` : ''}`,
      html: emailHtml,
      reply_to: contactData.email,
    });

    return response;
  } catch (error) {
    console.error('Resend error sending contact email:', error);
    throw new Error(`Failed to send contact email: ${error.message}`);
  }
}

/**
 * Send demo request notification email
 *
 * Sends an email notification when someone requests a demo.
 *
 * @param {Object} demoData - Demo request data
 * @param {string} demoData.name - Requester name
 * @param {string} demoData.email - Requester email
 * @param {string} demoData.company - Company name
 * @param {string} [demoData.phone] - Phone number
 * @param {string} [demoData.jobTitle] - Job title
 * @param {string} [demoData.companySize] - Company size
 * @param {string} [demoData.industry] - Industry
 * @param {string} [demoData.useCase] - Use case
 * @param {string} [demoData.timeline] - Timeline
 * @param {string} [demoData.message] - Additional message
 * @param {string} [demoData.preferredDate] - Preferred date
 * @param {Object} options - Email options
 * @param {string} [options.toEmail] - Recipient email
 * @param {string} [options.fromEmail] - Sender email
 * @returns {Promise<Object>} Resend API response
 * @throws {Error} If email sending fails
 */
export async function sendDemoRequestEmail(demoData, options = {}) {
  const resend = getResendClient();

  const toEmail = options.toEmail || process.env.DEMO_EMAIL || 'tom.coustols@tcdynamics.fr';
  const fromEmail = options.fromEmail || 'noreply@tcdynamics.fr';

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Demo Request</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: #f9f9f9;
      border-radius: 8px;
      padding: 30px;
      border: 1px solid #e0e0e0;
    }
    .header {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
      margin: -30px -30px 20px -30px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .priority-badge {
      display: inline-block;
      background: #ff6b6b;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-left: 10px;
    }
    .field {
      margin-bottom: 15px;
    }
    .field-label {
      font-weight: 600;
      color: #555;
      margin-bottom: 5px;
      font-size: 13px;
    }
    .field-value {
      background: white;
      padding: 10px;
      border-radius: 4px;
      border: 1px solid #e0e0e0;
    }
    .section {
      margin-top: 25px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
    }
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #444;
      margin-bottom: 15px;
    }
    .message-box {
      background: white;
      padding: 15px;
      border-radius: 4px;
      border-left: 4px solid #f5576c;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      color: #888;
      font-size: 12px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 New Demo Request<span class="priority-badge">HIGH PRIORITY</span></h1>
    </div>

    <div class="section-title">Contact Information</div>

    <div class="field">
      <div class="field-label">👤 Name:</div>
      <div class="field-value">${demoData.name}</div>
    </div>

    <div class="field">
      <div class="field-label">📧 Email:</div>
      <div class="field-value"><a href="mailto:${demoData.email}">${demoData.email}</a></div>
    </div>

    <div class="field">
      <div class="field-label">🏢 Company:</div>
      <div class="field-value">${demoData.company}</div>
    </div>

    ${demoData.phone ? `
    <div class="field">
      <div class="field-label">📞 Phone:</div>
      <div class="field-value"><a href="tel:${demoData.phone}">${demoData.phone}</a></div>
    </div>
    ` : ''}

    ${demoData.jobTitle ? `
    <div class="field">
      <div class="field-label">💼 Job Title:</div>
      <div class="field-value">${demoData.jobTitle}</div>
    </div>
    ` : ''}

    ${(demoData.companySize || demoData.industry) ? `
    <div class="section">
      <div class="section-title">Company Details</div>

      ${demoData.companySize ? `
      <div class="field">
        <div class="field-label">👥 Company Size:</div>
        <div class="field-value">${demoData.companySize}</div>
      </div>
      ` : ''}

      ${demoData.industry ? `
      <div class="field">
        <div class="field-label">🏭 Industry:</div>
        <div class="field-value">${demoData.industry}</div>
      </div>
      ` : ''}
    </div>
    ` : ''}

    ${(demoData.useCase || demoData.timeline || demoData.preferredDate) ? `
    <div class="section">
      <div class="section-title">Demo Details</div>

      ${demoData.useCase ? `
      <div class="field">
        <div class="field-label">🎯 Use Case:</div>
        <div class="field-value">${demoData.useCase}</div>
      </div>
      ` : ''}

      ${demoData.timeline ? `
      <div class="field">
        <div class="field-label">⏱️ Timeline:</div>
        <div class="field-value">${demoData.timeline}</div>
      </div>
      ` : ''}

      ${demoData.preferredDate ? `
      <div class="field">
        <div class="field-label">📅 Preferred Date:</div>
        <div class="field-value">${demoData.preferredDate}</div>
      </div>
      ` : ''}
    </div>
    ` : ''}

    ${demoData.message ? `
    <div class="section">
      <div class="section-title">Additional Message</div>
      <div class="message-box">${demoData.message}</div>
    </div>
    ` : ''}

    <div class="footer">
      Sent via TC Dynamics Demo Request Form<br>
      ${new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris' })} (Paris Time)
    </div>
  </div>
</body>
</html>
  `;

  try {
    const response = await resend.emails.send({
      from: `TC Dynamics Demo Requests <${fromEmail}>`,
      to: toEmail,
      subject: `🎯 Demo Request: ${demoData.company} - ${demoData.name}`,
      html: emailHtml,
      reply_to: demoData.email,
    });

    return response;
  } catch (error) {
    console.error('Resend error sending demo request email:', error);
    throw new Error(`Failed to send demo request email: ${error.message}`);
  }
}

export default getResendClient;
