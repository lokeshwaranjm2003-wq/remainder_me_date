const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const axios = require('axios');
const Reminder = require('./models/Reminder');
const User = require('./models/User');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files for Web UI

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/share', require('./routes/share'));

// Root endpoint
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Test endpoint to trigger reminders manually
app.get('/api/test-reminders', async (req, res) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  await processReminders(tomorrow, 'Morning');
  res.send('Reminders triggered for testing!');
});

const twilio = require('twilio');
const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) 
  : null;

// Telegram Configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const sendTelegramMessage = async (message) => {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message
    });
    console.log(`[TELEGRAM] Sent successfully`);
  } catch (err) {
    console.error(`[TELEGRAM Error]:`, err.message);
  }
};

// Notification Helper Function
const processReminders = async (checkDate, timeOfDay) => {
  console.log(`[CRON] Processing reminders for ${timeOfDay}...`);
  try {
    const allReminders = await Reminder.find({ isDeleted: { $ne: true } }).populate('userId');

    for (const reminder of allReminders) {
      if (!reminder.userId) continue;
      const user = reminder.userId;
      const remDate = new Date(reminder.date);
      
      const isMatch = remDate.getDate() === checkDate.getDate() && remDate.getMonth() === checkDate.getMonth();
      if (!isMatch) continue;

      let messageBody = '';
      if (timeOfDay === 'Midnight') {
        messageBody = `Hi ${user.username}! Today is ${reminder.personName}'s ${reminder.type} (${reminder.relationship}). Don't forget to wish them! 🎉`;
      } else if (timeOfDay === 'Morning') {
        messageBody = `Good morning ${user.username}! Tomorrow is ${reminder.personName}'s ${reminder.type} (${reminder.relationship}). Be prepared! 🎁`;
      } else if (timeOfDay === 'Evening') {
        messageBody = `Good evening ${user.username}! Just a reminder that tomorrow is ${reminder.personName}'s ${reminder.type} (${reminder.relationship}). Get ready! 🎈`;
      }

      if (messageBody && twilioClient && process.env.TWILIO_PHONE_NUMBER) {
        try {
          const formattedPhone = user.phoneNumber.startsWith('+') ? user.phoneNumber : `+91${user.phoneNumber}`;
          
          await twilioClient.messages.create({
            body: messageBody,
            from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
            to: `whatsapp:${formattedPhone}`
          });
          console.log(`[WHATSAPP] Sent to ${formattedPhone}`);
          
          await twilioClient.messages.create({
            body: messageBody,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhone
          });
          console.log(`[SMS] Sent to ${formattedPhone}`);
          
        } catch (msgErr) {
          console.error(`[Message Error] to ${user.phoneNumber}:`, msgErr.message);
        }
      }
      
      // Telegram Notification (Option 1 - Central Admin)
      if (messageBody) {
        await sendTelegramMessage(`[Reminder Alert for ${user.username}]\n${messageBody}`);
      }
    }
  } catch (error) {
    console.error(`[CRON Error ${timeOfDay}]`, error);
  }
};

// 1. Midnight (12:00 AM) - Today's events
cron.schedule('0 0 * * *', () => {
  const today = new Date();
  processReminders(today, 'Midnight');
});

// 2. Morning (6:00 AM) - Tomorrow's events
cron.schedule('0 6 * * *', () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  processReminders(tomorrow, 'Morning');
});

// 3. Evening (6:00 PM) - Tomorrow's events again
cron.schedule('0 18 * * *', () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  processReminders(tomorrow, 'Evening');
});

// Connect DB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/reminders_db', {
  tlsAllowInvalidCertificates: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
