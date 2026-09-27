// server/deleteExtraAdmin.js
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User'); // ⚠️ apna path check karo

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ DB connected\n');

    // Delete the .in user
    const del = await User.deleteOne({ email: 'admin@siyarampace.in' });
    console.log('🗑️  Deleted:', del.deletedCount, 'user(s)');

    // Final list
    const users = await User.find({}).select('email role');
    console.log('\n📋 Ab total users:', users.length);
    users.forEach(u => console.log('   -', u.email, '|', u.role));

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();