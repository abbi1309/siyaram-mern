const User = require('../models/User');
const Otp = require('../models/Otp');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// Email transporter
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
}

// Generate 6-digit OTP
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// ==================== REGISTER ====================
const register = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please fill all required fields' });
        }

        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const user = await User.create({ name, email, phone, password });

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            },
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== LOGIN ====================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            },
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== GET ME ====================
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== FORGOT PASSWORD — Send OTP ====================
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'No account found with this email' });
        }

        // Delete old OTPs for this email
        await Otp.deleteMany({ email, purpose: 'forgot-password' });

        // Generate new OTP
        const otp = generateOtp();

        // Save to DB
        await Otp.create({
            email,
            otp,
            purpose: 'forgot-password'
        });

        // Send via Email (if configured)
        let emailSent = false;
        if (transporter) {
            try {
                await transporter.sendMail({
                    from: `"Siyaram Palace" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: '🔐 Password Reset OTP - Siyaram Palace',
                    html: `
                        <div style="font-family: Arial; max-width: 500px; margin: auto; padding: 30px; background: #0A1E3F; border-radius: 16px;">
                            <div style="text-align: center; margin-bottom: 20px;">
                                <div style="font-size: 40px;">🕉️</div>
                                <h1 style="color: #D4AF37; margin: 10px 0; font-family: Georgia, serif;">Siyaram Palace</h1>
                            </div>
                            <div style="background: white; padding: 30px; border-radius: 12px; text-align: center;">
                                <h2 style="color: #0A1E3F; margin-top: 0;">Password Reset</h2>
                                <p style="color: #666; font-size: 14px;">Your OTP for password reset:</p>
                                <div style="font-size: 42px; font-weight: bold; color: #0A1E3F; letter-spacing: 8px; margin: 25px 0; padding: 20px; background: #FFF8E1; border-radius: 10px; font-family: monospace;">
                                    ${otp}
                                </div>
                                <p style="color: #999; font-size: 12px;">This OTP is valid for 10 minutes.</p>
                                <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
                            </div>
                            <p style="color: rgba(255,255,255,0.6); font-size: 11px; text-align: center; margin-top: 20px;">
                                © 2026 Siyaram Palace, Ayodhya
                            </p>
                        </div>
                    `
                });
                emailSent = true;
                console.log(`✅ OTP email sent to ${email}`);
            } catch (emailErr) {
                console.error('❌ Email error:', emailErr.message);
            }
        }

        // For development: show OTP in console

        mujres.json({
            success: true,
            message: 'OTP sent to your email address',
            email: user.email,
            phone: user.phone || '',   // 👈 Phone bhi bhejo (masked frontend pe)
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== VERIFY OTP ====================
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP required' });
        }

        // Find the most recent OTP
        const otpRecord = await Otp.findOne({
            email,
            purpose: 'forgot-password',
            verified: false
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({ success: false, message: 'OTP expired or not found. Please request a new one.' });
        }

        // Check attempts
        if (otpRecord.attempts >= 5) {
            await Otp.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ success: false, message: 'Too many attempts. Please request a new OTP.' });
        }

        // Check OTP
        if (otpRecord.otp !== otp) {
            otpRecord.attempts += 1;
            await otpRecord.save();
            return res.status(400).json({
                success: false,
                message: `Invalid OTP. ${5 - otpRecord.attempts} attempts remaining.`
            });
        }

        // Mark as verified
        otpRecord.verified = true;
        await otpRecord.save();

        // Generate short-lived reset token
        const resetToken = jwt.sign(
            { email, purpose: 'password-reset' },
            process.env.JWT_SECRET,
            { expiresIn: '10m' }
        );

        res.json({
            success: true,
            message: 'OTP verified successfully',
            resetToken
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== RESET PASSWORD ====================
const resetPassword = async (req, res) => {
    try {
        const { email, resetToken, newPassword } = req.body;

        if (!email || !resetToken || !newPassword) {
            return res.status(400).json({ success: false, message: 'All fields required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        // Verify reset token
        let decoded;
        try {
            decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        } catch (e) {
            return res.status(400).json({ success: false, message: 'Reset link expired. Please start over.' });
        }

        if (decoded.email !== email || decoded.purpose !== 'password-reset') {
            return res.status(400).json({ success: false, message: 'Invalid reset token' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update password (will be hashed by pre-save hook)
        user.password = newPassword;
        await user.save();

        // Clean up OTP records
        await Otp.deleteMany({ email, purpose: 'forgot-password' });

        res.json({
            success: true,
            message: 'Password reset successful! Please login with new password.'
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};




// ==================== UPDATE PASSWORD ====================
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Current and new password required' 
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'New password must be at least 6 characters' 
            });
        }

        const user = await User.findById(req.user._id).select('+password');
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Verify current password
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Current password is incorrect' 
            });
        }

        // Update password (model will hash it)
        user.password = newPassword;
        await user.save();

        res.json({ 
            success: true, 
            message: 'Password updated successfully' 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== UPDATE PROFILE ====================
const updateProfile = async (req, res) => {
    try {
        const { name, email, phone } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Email already in use' 
                });
            }
            user.email = email;
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};





module.exports = {
    register,
    login,
    getMe,
    forgotPassword,
    verifyOtp,
    resetPassword,
    updatePassword,
    updateProfile
};