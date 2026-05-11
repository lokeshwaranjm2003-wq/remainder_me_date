require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
  console.log('Testing default service: "gmail"...');
  let start = Date.now();
  let transporter1 = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  
  try {
    await transporter1.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Test 1',
      text: 'Test 1'
    });
    console.log(`Default config took ${Date.now() - start}ms`);
  } catch (err) {
    console.error('Error 1:', err);
  }

  console.log('Testing explicit host and port (465)...');
  start = Date.now();
  let transporter2 = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  
  try {
    await transporter2.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Test 2',
      text: 'Test 2'
    });
    console.log(`Explicit config took ${Date.now() - start}ms`);
  } catch (err) {
    console.error('Error 2:', err);
  }
};

testEmail();
