require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to DB:', process.env.MONGO_URI.split('@')[1]);
    const u = await User.findOne({ email: 'rishi@plm.io' });
    console.log('User exists?', !!u);
    if (u) {
      console.log('Password hash in DB:', u.password);
      const match = await u.comparePassword('password123');
      console.log('Password match?', match);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('DB error', err);
    process.exit(1);
  });
