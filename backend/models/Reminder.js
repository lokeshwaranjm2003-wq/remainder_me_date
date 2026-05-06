const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  personName: { type: String, required: true },
  date: { type: Date, required: true },
  type: { type: String, enum: ['DOB', 'Wedding'], required: true },
  relationship: { type: String, required: true },
  contactNumber: { type: String }, // For future WhatsApp/Telegram notifications
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Reminder', ReminderSchema);
