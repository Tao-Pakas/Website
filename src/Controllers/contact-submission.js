'use strict';

module.exports = ({ strapi }) => ({
  async create(ctx) {
    try {
      const { name, email, message, userId } = ctx.request.body;

      // Validate input
      if (!name || !email || !message) {
        return ctx.badRequest('Name, email, and message are required');
      }

      // Create submission in database
      const submission = await strapi.entityService.create(
        'api::contact-submission.contact-submission',
        {
          data: {
            name,
            email,
            message,
            status: 'pending',
            user: userId || null,
            publishedAt: new Date()
          }
        }
      );

      // Send email
      const emailResult = await strapi
        .service('api::contact-submission.contact-submission')
        .sendContactEmail(submission);

      if (!emailResult.success) {
        strapi.log.error('Failed to send email:', emailResult.error);
        // Still return success since submission was saved
      }

      return ctx.send({
        success: true,
        message: 'Your message has been sent successfully',
        data: submission
      });
    } catch (error) {
      strapi.log.error('Contact submission error:', error);
      return ctx.internalServerError('Failed to process contact form');
    }
  }
});