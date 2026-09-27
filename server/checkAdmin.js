// server/checkAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User'); // ⚠️ apna path check karo
                                       // agar models folder me file ka naam alag hai
                                       // (jaise userModel.js) to wahi likho

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ DB connected:', process.env.MONGODB_URI);

    // 1) Saare users dikhao
    const users = await User.find({}).select('email role isAdmin name');
    console.log('\n📋 Total users:', users.length);
    console.log(users);

    // 2) Admin ka password reset/create karo
    const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    const admin = await User.findOneAndUpdate(
      { email: process.env.ADMIN_EMAIL },
      {
        $set: {
          name: 'Admin',
          email: process.env.ADMIN_EMAIL,
          password: hashed,
          role: 'admin',
          isAdmin: true,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log('\n✅ Admin ready:');
    console.log('   Email   :', admin.email);
    console.log('   Password:', process.env.ADMIN_PASSWORD);
    console.log('   Role    :', admin.role || admin.isAdmin);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();