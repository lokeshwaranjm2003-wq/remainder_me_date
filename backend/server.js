const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const Reminder = require('./models/Reminder');
const User = require('./models/User');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reminders', require('./routes/reminders'));

// Notification Cron Job (Runs every day at 8:00 AM)
cron.schedule('0 8 * * *', async () => {
  console.log('[CRON] Checking for reminders today...');
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));
    
    // In a real app, we check month & day, not the absolute year.
    // Here we assume we fetch all reminders and filter them by month/date.
    const allReminders = await Reminder.find().populate('userId');

    allReminders.forEach(reminder => {
      if (!reminder.userId) return;
      const user = reminder.userId;
      const remDate = new Date(reminder.date);
      
      const isToday = remDate.getDate() === today.getDate() && remDate.getMonth() === today.getMonth();
      const isTomorrow = remDate.getDate() === tomorrow.getDate() && remDate.getMonth() === tomorrow.getMonth();

      if (isToday) {
        console.log(`[NOTIFICATION] Sending TODAY reminder to ${user.username} for ${reminder.personName}'s ${reminder.type}`);
        // Send SMS / FCM Push Notification
      } else if (isTomorrow) {
        console.log(`[NOTIFICATION] Sending TOMORROW reminder to ${user.username} for ${reminder.personName}'s ${reminder.type}`);
        // Send SMS / FCM Push Notification
      }
    });

  } catch (error) {
    console.error('[CRON Error]', error);
  }
});

// Connect DB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/reminders_db')
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
