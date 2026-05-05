const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const User = require('../models/User');

const router = express.Router();

// ─── In-Memory OTP Store (email/phone → { otp, expiresAt }) ────────────────────────
const otpStore = new Map();

// ─── Generate 6-digit OTP ─────────────────────────────────────────────────────
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ─── Nodemailer Transporter (Gmail) ──────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

// ─── Twilio Client ────────────────────────────────────────────────────────────
const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) 
  : null;

// ─── Send OTP via Email ───────────────────────────────────────────────────────
const sendOtpEmail = async (toEmail, otp) => {
  try {
    const formattedEmail = toEmail.trim().toLowerCase();
    const mailOptions = {
      from: `"RemindMe App" <${process.env.EMAIL_USER}>`,
      to: formattedEmail,
      subject: 'Your OTP for RemindMe App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #4CAF50; text-align: center;">RemindMe App</h2>
          <p>Your One-Time Password (OTP) is:</p>
          <h1 style="text-align: center; letter-spacing: 10px; color: #000080;">${otp}</h1>
          <p style="color: #666;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL OTP] Sent to ${formattedEmail}`);
  } catch (error) {
    console.error(`[EMAIL Error] Could not send to ${toEmail}:`, error.message);
  }
};

// ─── Send OTP via SMS ─────────────────────────────────────────────────────────
const sendOtpSms = async (phoneNumber, otp) => {
  try {
    // Basic formatting: ensure it has a country code (assuming +91 for India if missing)
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    
    if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
      await twilioClient.messages.create({
        body: `Your RemindMe App OTP is: ${otp}. It is valid for 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedPhone
      });
      console.log(`[SMS OTP] Sent to ${formattedPhone}`);
    } else {
      console.log(`[MOCK SMS] Would send SMS to ${formattedPhone} with OTP: ${otp} (Twilio not configured)`);
    }
  } catch (error) {
    console.error(`[SMS Error] Could not send to ${phoneNumber}:`, error.message);
  }
};

// ─── POST /api/auth/send-otp ─────────────────────────────────────────────────
router.post('/send-otp', async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    if (!email || !phoneNumber) {
      return res.status(400).json({ message: 'Email and phone number are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email: new RegExp(`^${email.trim()}$`, 'i') }, { phoneNumber: phoneNumber.trim() }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or phone number already exists' });
    }

    const otp = generateOTP();

    // Store OTP with 10 minute expiry
    otpStore.set(email.toLowerCase().trim(), { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

    // Send both email and SMS in parallel
    await Promise.all([
      sendOtpEmail(email, otp),
      sendOtpSms(phoneNumber, otp)
    ]);

    res.status(200).json({ message: `OTP sent to your Email and Mobile number.` });

  } catch (error) {
    console.error('[OTP Error]', error.message);
    res.status(500).json({ message: 'Failed to send OTP.', error: error.message });
  }
});

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { username, email, phoneNumber, password, otp, referralCode } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Validate OTP from server-side store
    const stored = otpStore.get(normalizedEmail);
    if (!stored) {
      return res.status(400).json({ message: 'OTP not found. Please request a new OTP.' });
    }
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(normalizedEmail);
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }
    if (stored.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    // OTP is valid — clear it
    otpStore.delete(normalizedEmail);

    const hashedPassword = await bcrypt.hash(password, 10);

    let referredByUserId = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.trim().toUpperCase() });
      if (referrer) {
        referredByUserId = referrer._id;
        // Add 50 points to the referrer's wallet
        referrer.walletBalance = (referrer.walletBalance || 0) + 50;
        await referrer.save();
      }
    }

    const newUser = new User({ 
      username: username.trim(), 
      email: normalizedEmail, 
      phoneNumber: phoneNumber.trim(), 
      password: hashedPassword,
      referredBy: referredByUserId
    });
    await newUser.save();

    res.status(201).json({ message: 'Registered successfully! Please sign in.' });

  } catch (error) {
    console.error('[Register Error]', error.message);
    res.status(500).json({ message: `Registration failed: ${error.message}` });
  }
});

// ─── POST /api/auth/send-login-otp ───────────────────────────────────────────
router.post('/send-login-otp', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Case-insensitive username search
    const user = await User.findOne({ username: new RegExp(`^${username.trim()}$`, 'i') });
    if (!user) return res.status(400).json({ message: 'Invalid username or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid username or password' });

    const otp = generateOTP();
    const normalizedEmail = user.email.toLowerCase().trim();
    otpStore.set(normalizedEmail, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

    // Send both email and SMS in parallel
    await Promise.all([
      sendOtpEmail(user.email, otp),
      sendOtpSms(user.phoneNumber, otp)
    ]);

    res.status(200).json({ message: `OTP sent to your Email and Mobile number.` });

  } catch (error) {
    console.error('[Login OTP Error]', error.message);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Case-insensitive username search
    const user = await User.findOne({ username: new RegExp(`^${username.trim()}$`, 'i') });
    if (!user) return res.status(400).json({ message: 'Invalid username or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid username or password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { 
        id: user._id, 
        username: user.username,
        referralCode: user.referralCode,
        walletBalance: user.walletBalance
      },
    });

  } catch (error) {
    console.error('[Login Error]', error.message);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

module.exports = router;
