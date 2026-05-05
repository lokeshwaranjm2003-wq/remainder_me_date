require('dotenv').config();
const mongoose = require('mongoose');
const Reminder = require('./models/Reminder');

mongoose.connect(process.env.MONGO_URI, { tlsAllowInvalidCertificates: true }).then(async () => {
  const reminders = await Reminder.find({});
  console.log("Reminders in DB:");
  reminders.forEach(r => console.log(r));
  process.exit(0);
}).catch(e => {
  console.log('Error:', e);
  process.exit(1);
});
