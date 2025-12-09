import nodemailer from 'nodemailer';

module.exports = ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'smtp.gmail.com'),
        port: env.int('SMTP_PORT', 587),
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
        // secure: true, // Use SSL
        // requireTLS: true,
      },
      settings: {
        defaultFrom: env('DEFAULT_FROM_EMAIL', 'noreply@yourdomain.com'),
        defaultReplyTo: env('DEFAULT_REPLY_TO', 'support@yourdomain.com'),
      },
    },
  },
});

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
})

export const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.DEFAULT_FROM_EMAIL,
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email: ', error);
  }
};