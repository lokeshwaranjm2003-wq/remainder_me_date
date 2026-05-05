require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const users = await User.find({});
  console.log("Users in DB:");
  users.forEach(u => {
    console.log(`Username: '${u.username}', Email: '${u.email}', Phone: '${u.phoneNumber}', PasswordHash: '${u.password}'`);
  });
  process.exit(0);
}).catch(e => {
  console.log('Error:', e);
  process.exit(1);
});
