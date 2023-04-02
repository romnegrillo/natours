const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1.) Create transporter.
  const transporter = nodemailer.createTransport({
    // service:"Gmail",
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // If you're gonna use Gmail, allow less secure apps in the settings.
  });

  // 2.) Define email options.
  const mailOptions = {
    from: 'natours <natours.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: '<h1>Hello world!</h1>',
  };

  // 3.) Send email.
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
