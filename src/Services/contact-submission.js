'use strict';

const nodemailer = require('nodemailer');

module.exports = ({ strapi }) => ({
  async sendContactEmail(submission) {
    try {
      // Create reusable transporter
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // Email to admin
      await transporter.sendMail({
        from: `"Contact Form" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL || 'admin@varsitycribs.com',
        subject: `New Contact Form: ${submission.name}`,
        text: `
New Contact Form Submission

Name: ${submission.name}
Email: ${submission.email}
Date: ${new Date().toLocaleString()}

Message:
${submission.message}
        `,
        html: `
<h3>New Contact Form Submission</h3>
<p><strong>Name:</strong> ${submission.name}</p>
<p><strong>Email:</strong> ${submission.email}</p>
<p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
<p><strong>Message:</strong></p>
<p>${submission.message}</p>
        `
      });

      // Auto-reply to user (optional)
      await transporter.sendMail({
        from: `"Varsity Cribs" <${process.env.SMTP_USER}>`,
        to: submission.email,
        subject: 'Thank you for contacting Varsity Cribs',
        text: `
Hi ${submission.name},

Thank you for reaching out to Varsity Cribs!

We have received your message and will get back to you within 24-48 hours.

Your message:
${submission.message}

Best regards,
Varsity Cribs Team
        `,
        html: `
<h3>Thank you for contacting Varsity Cribs!</h3>
<p>Hi ${submission.name},</p>
<p>We have received your message and will get back to you within 24-48 hours.</p>
<p><strong>Your message:</strong></p>
<p>${submission.message}</p>
<p>Best regards,<br>Varsity Cribs Team</p>
        `
      });

      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      strapi.log.error('Email sending error:', error);
      return { success: false, error: error.message };
    }
  }
});