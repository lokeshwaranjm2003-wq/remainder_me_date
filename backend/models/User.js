const mongoose = require('mongoose');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String },
  otpExpiry: { type: Date },
  pushToken: { type: String },
  // Referral & Wallet System
  referralCode: { type: String, unique: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  walletBalance: { type: Number, default: 0 }
}, { timestamps: true });

// Pre-save hook to generate a referral code if not present
UserSchema.pre('save', function() {
  if (!this.referralCode) {
    // Generate a unique 8-character code based on username and random bytes
    const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
    const baseName = this.username.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
    this.referralCode = `${baseName}${randomStr}`;
  }
});

module.exports = mongoose.model('User', UserSchema);
