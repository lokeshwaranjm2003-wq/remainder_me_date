require('dotenv').config();
const mongoose = require('mongoose');

console.log('MONGO_URI found:', process.env.MONGO_URI ? 'YES' : 'NO - MISSING!');
console.log('Connecting to Atlas...');

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('SUCCESS: MongoDB Atlas connected!');
    process.exit(0);
  })
  .catch(e => {
    console.log('FAILED:', e.message);
    process.exit(1);
  });
