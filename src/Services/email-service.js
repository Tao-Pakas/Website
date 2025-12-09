// src/services/email-service.js
'use strict';

module.exports = ({ strapi }) => ({
  async sendForgotPasswordEmail(user, resetToken) {
    const frontendUrl = strapi.config.get('server.frontendUrl', 'http://localhost:3000');
    
    const template = {
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset</h2>
          <p>Hi ${user.username || 'there'},</p>
          <p>Click the link below to reset your password:</p>
          <a href="${frontendUrl}/reset-password?code=${resetToken}" 
             style="background: #007bff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
          <p style="margin-top: 20px; color: #666; font-size: 14px;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
      `,
    };

    await strapi.plugins['email'].services.email.send({
      to: user.email,
      from: strapi.config.get('plugins.email.settings.defaultFrom'),
      ...template,
    });
  },

  async sendEmailConfirmation(user, confirmationToken) {
    const backendUrl = strapi.config.get('server.url', 'http://localhost:1337');
    
    const template = {
      subject: 'Confirm Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Confirmation</h2>
          <p>Welcome ${user.username || 'there'}!</p>
          <p>Please confirm your email by clicking below:</p>
          <a href="${backendUrl}/api/auth/email-confirmation?confirmation=${confirmationToken}" 
             style="background: #28a745; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Confirm Email
          </a>
          <p style="margin-top: 20px; color: #666; font-size: 14px;">
            This link expires in 24 hours.
          </p>
        </div>
      `,
    };

    await strapi.plugins['email'].services.email.send({
      to: user.email,
      from: strapi.config.get('plugins.email.settings.defaultFrom'),
      ...template,
    });
  },

  async sendWelcomeEmail(user) {
    const template = {
      subject: 'Welcome to Our Platform!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome Aboard!</h2>
          <p>Hi ${user.username}, thanks for joining us!</p>
          <p>Your account is now active and ready to use.</p>
          <p>Get started by exploring our features.</p>
          <a href="${strapi.config.get('server.frontendUrl', 'http://localhost:3000')}/dashboard" 
             style="background: #6f42c1; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
      `,
    };

    await strapi.plugins['email'].services.email.send({
      to: user.email,
      from: strapi.config.get('plugins.email.settings.defaultFrom'),
      ...template,
    });
  },
});