const mongoose = require('mongoose');
require('dotenv').config();
const Room = require('./models/Room');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ DB connected\n');

    const rooms = await Room.find({});
    rooms.forEach(r => {
      console.log('🏨 Room #' + r.roomNumber, '|', r.name);
      console.log('   image :', r.image);
      console.log('   images:', r.images);
      console.log('---');
    });

    process.exit(0);
  } catch (e) {
    console.error('❌', e.message);
    process.exit(1);
  }
})();