// server/testLogin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User'); // ⚠️ apna path check karo

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ DB connected\n');

    const email = 'admin@siyaram.com';
    const testPassword = 'siyaram@123';

    // 1) User nikaalo
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('❌ User not found:', email);
      process.exit(1);
    }

    console.log('👤 User mila:', user.email);
    console.log('   Role     :', user.role);
    console.log('   Hash     :', user.password.substring(0, 30) + '...');
    console.log('   Hash len :', user.password.length);

    // 2) Compare karo
    const match = await bcrypt.compare(testPassword, user.password);
    console.log('\n🔐 Password compare:', match ? '✅ MATCH' : '❌ MISMATCH');

    // 3) Agar mismatch, to naya hash banao aur DB me daalo
    if (!match) {
      console.log('\n⚠️  Mismatch! Naya hash bana ke DB me daal rahe hain...');
      const newHash = await bcrypt.hash(testPassword, 10);

      await User.updateOne(
        { email },
        { $set: { password: newHash } }
      );

      // Verify
      const updated = await User.findOne({ email }).select('+password');
      const verify = await bcrypt.compare(testPassword, updated.password);
      console.log('   Naya hash length:', newHash.length);
      console.log('   Verify         :', verify ? '✅ AB MATCH' : '❌ phir bhi mismatch');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
})();