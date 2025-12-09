// pages/api/contact.js
import { transporter } from '../../config/nodemailer';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { name, email, message, phone, userRole, userId, userDocumentId } = req.body;

    console.log('📧 Contact form submission from AppContext:', { 
      name, email, userRole, userId, userDocumentId 
    });

    // Basic validation
    if (!name || !email || !message) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({ 
        success: false, 
        message: 'Name and message are required.' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Validation failed: Invalid email');
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address.' 
      });
    }

    // HTML email content with AppContext info
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .field { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; color: #555; display: block; margin-bottom: 5px; font-size: 14px; }
            .value { color: #333; font-size: 16px; }
            .user-info { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #2196f3; }
            .message-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin-top: 10px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">📨 New Contact Form Submission</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Varsity Cribs Website</p>
          </div>
          <div class="content">
            <div class="user-info">
              <h3 style="margin-top: 0; color: #1976d2;">👤 User Information</h3>
              <div class="field">
                <span class="label">Name:</span>
                <span class="value">${name}</span>
              </div>
              <div class="field">
                <span class="label">Email:</span>
                <span class="value">${email}</span>
              </div>
              ${userRole ? `
              <div class="field">
                <span class="label">User Role:</span>
                <span class="value">${userRole}</span>
              </div>
              ` : ''}
              ${userId ? `
              <div class="field">
                <span class="label">User ID:</span>
                <span class="value">${userId}</span>
              </div>
              ` : ''}
            </div>
            
            <div class="field">
              <span class="label">📱 Phone:</span>
              <span class="value">${phone || 'Not provided'}</span>
            </div>
            
            <div class="field" style="border: none;">
              <span class="label">💬 Message:</span>
              <div class="message-box">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <div class="footer">
              <p>🕒 Submitted: ${new Date().toLocaleString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p>📍 Source: ${userRole ? 'Logged-in User' : 'Guest'} | IP: ${req.headers['x-forwarded-for'] || req.socket.remoteAddress}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Plain text version
    const textContent = `
      NEW CONTACT FORM SUBMISSION - FROM ${userRole ? 'LOGGED-IN USER' : 'GUEST'}
      ===================================================================
      
      USER INFORMATION:
      Name: ${name}
      Email: ${email}
      ${userRole ? `Role: ${userRole}\n` : ''}
      ${userId ? `User ID: ${userId}\n` : ''}
      ${userDocumentId ? `Document ID: ${userDocumentId}\n` : ''}
      
      CONTACT DETAILS:
      Phone: ${phone || 'Not provided'}
      
      MESSAGE:
      ${message}
      
      TECHNICAL INFO:
      Submitted: ${new Date().toLocaleString()}
      Source: ${userRole ? 'Logged-in User' : 'Guest'}
      IP: ${req.headers['x-forwarded-for'] || req.socket.remoteAddress}
    `;

    // Email configuration
    const mailOptions = {
      from: {
        name: `${name} ${userRole ? `(${userRole})` : ''}`,
        address: process.env.SMTP_USERNAME || 'noreply@varsitycribs.com'
      },
      to: process.env.CONTACT_RECIPIENT_EMAIL || 'contact@varsitycribs.com',
      subject: `New Contact: ${name} ${userRole ? `[${userRole}]` : ''}`,
      text: textContent,
      html: htmlContent,
      replyTo: `${name} <${email}>`,
    };

    console.log('📤 Sending email to:', mailOptions.to);
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', info.messageId);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Thank you! Your message has been sent successfully.',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('❌ Error sending contact form email:', error);
    
    return res.status(500).json({ 
      success: false, 
      message: 'Unable to send message. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}