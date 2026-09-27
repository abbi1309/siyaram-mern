 
const nodemailer = require('nodemailer');

let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    console.log('Email service ready');
}

async function sendBookingEmail(booking, room, user) {
    if (!transporter) {
        console.log('Email service not configured');
        return;
    }

    const isPaid = booking.paymentStatus === 'Paid';
    const subject = isPaid
        ? `Booking Confirmed - ${booking.bookingId}`
        : `Booking Received - ${booking.bookingId}`;

    const mailOptions = {
        from: `"Siyaram Palace" <${process.env.EMAIL_USER}>`,
        to: booking.guestEmail || user?.email,
        subject,
        html: `
            <div style="font-family: Poppins, Arial; max-width: 600px; margin: auto; background: #F8F9FA; padding: 20px; border-radius: 12px;">
                <div style="text-align: center; padding: 30px; background: #0A1E3F; color: white; border-radius: 12px 12px 0 0;">
                    <h1 style="color: #D4AF37; margin: 0;">Siyaram Palace</h1>
                    <p style="margin: 8px 0 0; opacity: 0.8;">Ayodhya, Uttar Pradesh</p>
                </div>
                <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px;">
                    <p style="font-size: 16px;">Namaste <strong>${booking.guestName}</strong></p>
                    <p>${isPaid ? 'Aapki booking confirm ho gayi hai!' : 'Aapki booking request receive ho gayi hai.'}</p>
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Booking ID</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.bookingId}</td></tr>
                        <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Room</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${room?.roomType || 'Room'} (${room?.roomNumber || 'N/A'})</td></tr>
                        <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Check-In</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${new Date(booking.checkIn).toLocaleDateString('en-IN')}</td></tr>
                        <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Check-Out</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${new Date(booking.checkOut).toLocaleDateString('en-IN')}</td></tr>
                        <tr><td style="padding: 10px;"><strong>Total Amount</strong></td><td style="padding: 10px; color: #D4AF37; font-weight: bold;">Rs ${booking.amount}</td></tr>
                    </table>
                    <p style="color: #666; font-size: 13px;">Contact: +91-9315377668</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${booking.guestEmail || user?.email}`);
    } catch (error) {
        console.error('Email error:', error.message);
    }
}

module.exports = { sendBookingEmail };