const express = require('express');
const Reminder = require('../models/Reminder');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to authenticate
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Add Reminder
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { personName, date, type, relationship } = req.body;

    const reminder = new Reminder({
      userId: req.user.id,
      personName,
      date,
      type,
      relationship
    });

    await reminder.save();
    res.status(201).json({ message: 'Reminder added successfully', reminder });
  } catch (error) {
    res.status(500).json({ message: 'Error adding reminder', error: error.message });
  }
});

// Get Reminders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user.id }).sort({ date: 1 });
    res.status(200).json(reminders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reminders', error: error.message });
  }
});

module.exports = router;
