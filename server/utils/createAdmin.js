require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const adminEmail = 'admin@siyarampace.in';
        const adminPassword = 'siyaram@123';
        const adminName = 'Admin';
        const adminPhone = '9315377668';

        // Check if admin exists
        const exists = await User.findOne({ email: adminEmail });
        if (exists) {
            console.log(`⚠️  Admin already exists: ${adminEmail}`);
            
            // Update role to admin just in case
            exists.role = 'admin';
            await exists.save();
            console.log('✅ Admin role confirmed');
            
            await mongoose.disconnect();
            process.exit(0);
        }

        // Create admin user
        const admin = await User.create({
            name: adminName,
            email: adminEmail,
            phone: adminPhone,
            password: adminPassword,
            role: 'admin'
        });

        console.log('\n🎉 Admin user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📧 Email:    ${adminEmail}`);
        console.log(`🔐 Password: ${adminPassword}`);
        console.log(`👤 Role:     admin`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createAdmin();