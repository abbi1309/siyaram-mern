// ============================================
// BOOKING EMAIL NOTIFICATION
// Admin ko booking aane pe email bhejta hai
// ============================================

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendBookingEmail = async (booking) => {
    try {
        const roomNumber = booking.room?.roomNumber || 'N/A';
        const checkInDate = new Date(booking.checkIn).toLocaleDateString('en-IN');
        const checkOutDate = new Date(booking.checkOut).toLocaleDateString('en-IN');

        const mailOptions = {
            from: `"Siyaram Palace Booking" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_TO || process.env.EMAIL_USER,
            subject: `🔔 New Booking — ${booking.name} (Room ${roomNumber})`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
                    <div style="background: #0A1E3F; padding: 25px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h2 style="color: #D4AF37; margin: 0; font-family: Georgia, serif;">
                            🔔 New Booking Received
                        </h2>
                        <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 13px;">
                            Siyaram Palace Admin Notification
                        </p>
                    </div>

                    <div style="background: white; padding: 25px; border-radius: 0 0 10px 10px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 10px 0; font-weight: 700; color: #0A1E3F; width: 140px;">👤 Guest Name:</td>
                                <td style="padding: 10px 0; color: #333;">${booking.name || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; font-weight: 700; color: #0A1E3F;">📧 Email:</td>
                                <td style="padding: 10px 0; color: #333;">${booking.email || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; font-weight: 700; color: #0A1E3F;">📞 Phone:</td>
                                <td style="padding: 10px 0; color: #333;">${booking.phone || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; font-weight: 700; color: #0A1E3F;">🏨 Room:</td>
                                <td style="padding: 10px 0; color: #333;">${roomNumber}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; font-weight: 700; color: #0A1E3F;">📅 Check-In:</td>
                                <td style="padding: 10px 0; color: #333;">${checkInDate}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; font-weight: 700; color: #0A1E3F;">📅 Check-Out:</td>
                                <td style="padding: 10px 0; color: #333;">${checkOutDate}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; font-weight: 700; color: #0A1E3F;">💰 Total:</td>
                                <td style="padding: 10px 0; color: #333; font-weight: 800;">₹${booking.totalAmount || 'N/A'}</td>
                            </tr>
                        </table>

                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

                        <a href="https://siyaram-mern-siyaram2.vercel.app/admin/bookings"
                           style="display: inline-block; padding: 12px 24px; background: #D4AF37; color: #0A1E3F;
                                  text-decoration: none; border-radius: 8px; font-weight: 700;">
                            View in Admin Panel →
                        </a>

                        <p style="font-size: 11px; color: #888; margin-top: 20px;">
                            Received on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                        </p>
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Booking notification email sent');
    } catch (error) {
        console.error('❌ Email send failed:', error.message);
        // Don't throw — booking should still succeed
    }
};

module.exports = sendBookingEmail;