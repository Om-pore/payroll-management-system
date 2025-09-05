// test-email.js
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Error with email configuration:', error);
  } else {
    console.log('Email server is ready to send messages');
    
    // Send a test email
    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Test Email from Payroll System',
      text: 'This is a test email from your payroll management system.'
    }, (err, info) => {
      if (err) {
        console.error('Error sending test email:', err);
      } else {
        console.log('Test email sent successfully:', info.response);
      }
    });
  }
});