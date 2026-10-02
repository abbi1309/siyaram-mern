// ============================================
// BOOKING CONTROLLER
// Saare booking operations yahan handle hote hain
// - Create booking (with coupon support)
// - Get bookings
// - Invoice
// - Cancellation
// - Booked dates
// ============================================

// Database models
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Review = require('../models/Review');

// Utility functions
const generateInvoicePDF = require('../utils/generatePDF');

// PDF generation
const PDFDocument = require('pdfkit');

// Coupon usage increment
const { incrementUsage } = require('./couponController');

// Email + Notification utilities
const sendBookingEmail = require('../utils/sendBookingEmail');
const { createNotification } = require('./notificationController');


// ============================================
// CREATE BOOKING
// Naya booking banata hai (coupon support ke saath)
// ============================================
const createBooking = async (req, res) => {
    try {
        // ---------- REQUEST BODY ----------
        const {
            roomId,
            checkIn,
            checkOut,
            guests,
            specialRequests,
            guestPhone,
            couponCode,
            discountAmount,
        } = req.body;

        // ============================================
        // ⚠️ INPUT VALIDATION
        // ============================================

        // 1. Room ID check
        if (!roomId || typeof roomId !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Room ID required',
            });
        }

        // 2. Check-in / Check-out required
        if (!checkIn || !checkOut) {
            return res.status(400).json({
                success: false,
                message: 'Check-in aur check-out dates required',
            });
        }

        // 3. Phone number — 10 digits only
        if (!guestPhone || !/^[0-9]{10}$/.test(guestPhone)) {
            return res.status(400).json({
                success: false,
                message: 'Valid 10-digit phone number daalein',
            });
        }

        // 4. Guests — 1 to 10
        const guestsNum = Number(guests);
        if (!guestsNum || guestsNum < 1 || guestsNum > 10) {
            return res.status(400).json({
                success: false,
                message: 'Guests 1 se 10 ke beech hone chahiye',
            });
        }

        // 5. Special requests — max 500 chars
        if (
            specialRequests &&
            typeof specialRequests === 'string' &&
            specialRequests.length > 500
        ) {
            return res.status(400).json({
                success: false,
                message: 'Special requests 500 chars se kam honi chahiye',
            });
        }

        // 6. Date format check
        const checkInDateCheck = new Date(checkIn);
        const checkOutDateCheck = new Date(checkOut);

        if (
            isNaN(checkInDateCheck.getTime()) ||
            isNaN(checkOutDateCheck.getTime())
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format',
            });
        }

        // 7. Check-out must be after check-in
        if (checkInDateCheck >= checkOutDateCheck) {
            return res.status(400).json({
                success: false,
                message: 'Check-out check-in ke baad hona chahiye',
            });
        }

        // 8. Past date block
        const todayCheck = new Date();
        todayCheck.setHours(0, 0, 0, 0);
        if (checkInDateCheck < todayCheck) {
            return res.status(400).json({
                success: false,
                message: 'Past date ke liye booking nahi ho sakti',
            });
        }

        // ============================================
        // ✅ VALIDATION PASS
        // ============================================

        // ---------- ROOM EXIST CHECK ----------
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found',
            });
        }

        // ==================== OVERLAP CHECK ====================
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (
            isNaN(checkInDate) ||
            isNaN(checkOutDate) ||
            checkInDate >= checkOutDate
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid dates. Check-out must be after check-in.',
            });
        }

        const conflicting = await Booking.findOne({
            room: roomId,
            status: { $in: ['Confirmed', 'Checked-In'] },
            checkIn: { $lt: checkOutDate },
            checkOut: { $gt: checkInDate },
        });

        if (conflicting) {
            return res.status(400).json({
                success: false,
                message:
                    'Ye room in dates ke liye already booked hai. Kripya dusri dates ya dusra room choose karein.',
            });
        }

        // ---------- NIGHTS CALCULATE ----------
        const nights = Math.max(
            1,
            Math.ceil(
                (new Date(checkOut) - new Date(checkIn)) /
                    (1000 * 60 * 60 * 24)
            )
        );

        // ---------- FLAT PRICE ₹1500/night (all taxes included) ----------
        const FLAT_PRICE = 1500;
        const originalAmount = FLAT_PRICE * nights;

        // ---------- COUPON DISCOUNT HANDLE ----------
        const safeDiscount = Math.min(
            Math.max(Number(discountAmount) || 0, 0),
            originalAmount
        );

        const totalAmount = originalAmount - safeDiscount;

        // GST reverse-calculate on FINAL amount (after discount)
        const gstRate = 12;
        const subtotal = Math.round((totalAmount * 100) / (100 + gstRate));
        const totalTax = totalAmount - subtotal;
        const cgstAmount = Math.floor(totalTax / 2);
        const sgstAmount = cgstAmount;
        const adjustedTotalTax = cgstAmount + sgstAmount;

        // ---------- INVOICE NUMBER GENERATE ----------
        const year = new Date().getFullYear();
        const lastBooking = await Booking.findOne({
            invoiceNumber: { $regex: `^SYR${year}` },
        }).sort({ invoiceNumber: -1 });

        let nextNum = 1;
        if (lastBooking && lastBooking.invoiceNumber) {
            const lastNum = parseInt(
                lastBooking.invoiceNumber.slice(-5),
                10
            );
            if (!isNaN(lastNum)) nextNum = lastNum + 1;
        }

        const invoiceNumber = `SYR${year}${String(nextNum).padStart(5, '0')}`;

        // ---------- CREATE BOOKING ----------
        const booking = await Booking.create({
            user: req.user._id,
            room: roomId,

            guestName: req.user.name,
            guestEmail: req.user.email || '',
            amount: totalAmount,

            checkIn,
            checkOut,
            nights,
            guests: Number(guests),
            specialRequests,
            guestPhone,

            subtotal,
            gstRate,
            cgstAmount,
            sgstAmount,
            totalTax,
            totalAmount,

            couponCode: couponCode || null,
            discountAmount: safeDiscount,

            invoiceNumber,
            invoiceDate: new Date(),
            paymentStatus: 'pending',
            status: 'Pending',
        });

        // ---------- INCREMENT COUPON USAGE ----------
        if (couponCode && safeDiscount > 0) {
            try {
                await incrementUsage(couponCode, req.user._id);
            } catch (couponErr) {
                console.error('Coupon increment failed:', couponErr.message);
            }
        }

        // ============================================
        // ✅ ADMIN EMAIL NOTIFICATION BHEJO
        // ============================================
        try {
            const populatedBooking = await Booking.findById(booking._id).populate(
                'room',
                'roomNumber roomType'
            );
            await sendBookingEmail(populatedBooking);
            console.log('✅ Booking notification email sent');
        } catch (emailErr) {
            console.error('❌ Booking email failed:', emailErr.message);
            // Booking fail nahi karni email fail hone se
        }

        // ============================================
        // ✅ ADMIN BELL NOTIFICATION CREATE KARO
        // ============================================
        try {
            await createNotification({
                type: 'booking',
                title: `New Booking — ${booking.guestName || 'Guest'}`,
                message: `Room ${room.roomNumber} • ₹${booking.totalAmount} • ${new Date(booking.checkIn).toLocaleDateString('en-IN')}`,
                link: '/admin/bookings',
                metadata: { bookingId: booking._id },
            });
            console.log('✅ Bell notification created');
        } catch (notifErr) {
            console.error('❌ Notification create failed:', notifErr.message);
        }

        // ---------- RESPONSE ----------
        res.status(201).json({
            success: true,
            booking,
        });
    } catch (err) {
        console.error('createBooking error:', err);
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};


// ============================================
// GET MY BOOKINGS
// ============================================
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('room', 'roomNumber roomType pricePerNight images')
            .sort({ createdAt: -1 });

        const bookingsWithReview = await Promise.all(
            bookings.map(async (b) => {
                const review = await Review.findOne({ booking: b._id });
                return {
                    ...b.toObject(),
                    hasReview: !!review,
                    reviewId: review?._id || null,
                };
            })
        );

        res.json({
            success: true,
            count: bookingsWithReview.length,
            bookings: bookingsWithReview,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// ============================================
// GET BOOKING BY ID
// ============================================
const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('room')
            .populate('user', 'name email phone');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        if (
            booking.user._id.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized',
            });
        }

        res.json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// ============================================
// DOWNLOAD INVOICE (PDF)
// ============================================
const downloadInvoice = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('user', 'name email')
            .populate('room', 'roomType roomNumber');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        const doc = new PDFDocument({ margin: 40, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=invoice-${booking.invoiceNumber || booking._id}.pdf`
        );
        doc.pipe(res);

        const navy = '#0A1E3F';
        const gold = '#D4AF37';
        const gray = '#666';
        const green = '#22C55E';

        // ---------- HEADER ----------
        doc.fontSize(26)
            .fillColor(navy)
            .font('Helvetica-Bold')
            .text(process.env.HOTEL_NAME || 'SIYARAM PALACE', 40, 40);

        doc.fontSize(9)
            .fillColor(gray)
            .font('Helvetica')
            .text(process.env.HOTEL_ADDRESS || '', 40, 75)
            .text(`Phone: ${process.env.HOTEL_PHONE || ''}`, 40, 88)
            .text(`Email: ${process.env.HOTEL_EMAIL || ''}`, 40, 101)
            .text(`GSTIN: ${process.env.HOTEL_GSTIN || ''}`, 40, 114)
            .text(
                `State: ${process.env.HOTEL_STATE} (Code: ${process.env.HOTEL_STATE_CODE})`,
                40,
                127
            );

        doc.roundedRect(430, 40, 130, 35, 6).fill(gold);
        doc.fontSize(13)
            .fillColor('#fff')
            .font('Helvetica-Bold')
            .text('TAX INVOICE', 430, 51, { width: 130, align: 'center' });

        doc.moveTo(40, 155).lineTo(560, 155).strokeColor('#ddd').stroke();

        // ---------- BILL TO + INVOICE DETAILS ----------
        const y = 175;

        doc.fontSize(10)
            .fillColor(navy)
            .font('Helvetica-Bold')
            .text('BILL TO:', 40, y);
        doc.fontSize(10)
            .fillColor('#333')
            .font('Helvetica')
            .text(booking.user?.name || 'Guest', 40, y + 18)
            .text(`Phone: ${booking.guestPhone || '-'}`, 40, y + 33)
            .text(`Email: ${booking.user?.email || '-'}`, 40, y + 48);

        doc.fontSize(10)
            .fillColor(navy)
            .font('Helvetica-Bold')
            .text('INVOICE DETAILS:', 320, y);
        doc.fontSize(10)
            .fillColor('#333')
            .font('Helvetica')
            .text(`Invoice No: ${booking.invoiceNumber || '-'}`, 320, y + 18)
            .text(
                `Date: ${new Date(
                    booking.invoiceDate || booking.createdAt
                ).toLocaleDateString('en-IN')}`,
                320,
                y + 33
            )
            .text(`Place of Supply: ${process.env.HOTEL_STATE}`, 320, y + 48)
            .text(
                `Status: ${
                    booking.paymentStatus === 'paid' ? 'Paid' : 'Pending'
                }`,
                320,
                y + 63
            );

        // ---------- ROOM TABLE ----------
        const tableTop = 280;
        const rowHeight = 25;

        doc.rect(40, tableTop, 520, 25).fill(navy);
        doc.fontSize(9)
            .fillColor('#fff')
            .font('Helvetica-Bold')
            .text('ROOM', 50, tableTop + 8)
            .text('HSN/SAC', 180, tableTop + 8)
            .text('CHECK-IN', 260, tableTop + 8)
            .text('CHECK-OUT', 340, tableTop + 8)
            .text('NIGHTS', 430, tableTop + 8)
            .text('AMOUNT', 490, tableTop + 8);

        doc.rect(40, tableTop + 25, 520, rowHeight).fill('#F8F8F8');
        doc.fontSize(9)
            .fillColor('#333')
            .font('Helvetica')
            .text(
                `${booking.room?.roomType || '-'} (${
                    booking.room?.roomNumber || ''
                })`,
                50,
                tableTop + 33
            )
            .text(process.env.HOTEL_SAC_CODE || '996311', 180, tableTop + 33)
            .text(
                new Date(booking.checkIn).toLocaleDateString('en-IN'),
                260,
                tableTop + 33
            )
            .text(
                new Date(booking.checkOut).toLocaleDateString('en-IN'),
                340,
                tableTop + 33
            )
            .text(String(booking.nights || 1), 430, tableTop + 33)
            .text(`Rs ${booking.subtotal}`, 490, tableTop + 33);

        doc.rect(40, tableTop, 520, 25 + rowHeight).stroke('#ddd');

        // ---------- PAYMENT SUMMARY ----------
        const sumTop = 400;
        doc.fontSize(11)
            .fillColor(navy)
            .font('Helvetica-Bold')
            .text('PAYMENT SUMMARY', 380, sumTop);

        doc.fontSize(10).font('Helvetica').fillColor('#333');
        const labelX = 380;
        const valueX = 500;

        doc.text('Room Charges:', labelX, sumTop + 25).text(
            `Rs ${booking.subtotal}`,
            valueX,
            sumTop + 25
        );

        doc.text(`CGST @ ${booking.gstRate / 2}%:`, labelX, sumTop + 45).text(
            `Rs ${booking.cgstAmount}`,
            valueX,
            sumTop + 45
        );

        doc.text(`SGST @ ${booking.gstRate / 2}%:`, labelX, sumTop + 65).text(
            `Rs ${booking.sgstAmount}`,
            valueX,
            sumTop + 65
        );

        if (booking.discountAmount && booking.discountAmount > 0) {
            doc.fillColor('#22C55E')
                .text(
                    `Discount (${booking.couponCode || 'Coupon'}):`,
                    labelX,
                    sumTop + 85
                )
                .text(
                    `- Rs ${booking.discountAmount}`,
                    valueX,
                    sumTop + 85
                );

            doc.moveTo(labelX, sumTop + 105)
                .lineTo(560, sumTop + 105)
                .stroke('#ddd');

            doc.fontSize(12).font('Helvetica-Bold').fillColor(navy);
            doc.text('Total:', labelX, sumTop + 115).text(
                `Rs ${booking.totalAmount}`,
                valueX,
                sumTop + 115
            );

            const paidAmount =
                booking.paymentStatus === 'paid' ? booking.totalAmount : 0;
            doc.fontSize(11).font('Helvetica').fillColor(green);
            doc.text('Amount Paid:', labelX, sumTop + 140).text(
                `Rs ${paidAmount}`,
                valueX,
                sumTop + 140
            );

            const badgeTop = sumTop + 175;
            const badgeColor =
                booking.paymentStatus === 'paid' ? green : '#F59E0B';

            doc.roundedRect(380, badgeTop, 180, 50, 8).fillAndStroke(
                '#FFF9E6',
                badgeColor
            );
            doc.fontSize(9)
                .fillColor(badgeColor)
                .font('Helvetica-Bold')
                .text('PAYMENT STATUS', 380, badgeTop + 10, {
                    width: 180,
                    align: 'center',
                });
            doc.fontSize(16)
                .fillColor(badgeColor)
                .font('Helvetica-Bold')
                .text(
                    booking.paymentStatus === 'paid' ? 'PAID' : 'PENDING',
                    380,
                    badgeTop + 24,
                    { width: 180, align: 'center' }
                );
        } else {
            doc.moveTo(labelX, sumTop + 85)
                .lineTo(560, sumTop + 85)
                .stroke('#ddd');

            doc.fontSize(12).font('Helvetica-Bold').fillColor(navy);
            doc.text('Total:', labelX, sumTop + 95).text(
                `Rs ${booking.totalAmount}`,
                valueX,
                sumTop + 95
            );

            const paidAmount =
                booking.paymentStatus === 'paid' ? booking.totalAmount : 0;
            doc.fontSize(11).font('Helvetica').fillColor(green);
            doc.text('Amount Paid:', labelX, sumTop + 120).text(
                `Rs ${paidAmount}`,
                valueX,
                sumTop + 120
            );

            const badgeTop = sumTop + 155;
            const badgeColor =
                booking.paymentStatus === 'paid' ? green : '#F59E0B';

            doc.roundedRect(380, badgeTop, 180, 50, 8).fillAndStroke(
                '#FFF9E6',
                badgeColor
            );
            doc.fontSize(9)
                .fillColor(badgeColor)
                .font('Helvetica-Bold')
                .text('PAYMENT STATUS', 380, badgeTop + 10, {
                    width: 180,
                    align: 'center',
                });
            doc.fontSize(16)
                .fillColor(badgeColor)
                .font('Helvetica-Bold')
                .text(
                    booking.paymentStatus === 'paid' ? 'PAID' : 'PENDING',
                    380,
                    badgeTop + 24,
                    { width: 180, align: 'center' }
                );
        }

        // ---------- FOOTER ----------
        doc.fontSize(8)
            .fillColor(gray)
            .font('Helvetica')
            .text(
                'This is a computer-generated invoice. No signature required.',
                40,
                720,
                { width: 520, align: 'center' }
            )
            .text(
                `For any queries: ${process.env.HOTEL_PHONE} | ${process.env.HOTEL_EMAIL}`,
                40,
                735,
                { width: 520, align: 'center' }
            );

        doc.end();
    } catch (err) {
        console.error('downloadInvoice error:', err);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};


// ============================================
// REQUEST CANCELLATION
// ============================================
const requestCancellation = async (req, res) => {
    try {
        const { reason } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized',
            });
        }

        if (booking.status === 'Cancelled' || booking.status === 'Completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel this booking',
            });
        }

        if (booking.cancelRequest.status === 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Cancel request already pending',
            });
        }

        booking.cancelRequest = {
            requested: true,
            reason: reason || 'No reason provided',
            requestedAt: new Date(),
            status: 'pending',
        };

        await booking.save();

        res.json({
            success: true,
            message: 'Cancellation request sent to admin',
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// ============================================
// GET BOOKED DATES FOR ROOM
// ============================================
const getBookedDates = async (req, res) => {
    try {
        const { roomId } = req.params;

        console.log('=== 📅 GET BOOKED DATES ===');
        console.log('Room ID:', roomId);

        const bookings = await Booking.find({ room: roomId });

        console.log('Total bookings found:', bookings.length);

        const bookedDates = [];

        bookings.forEach((b) => {
            console.log(
                `Booking ${b._id} | Status: ${b.status} | CheckIn: ${b.checkIn} | CheckOut: ${b.checkOut}`
            );

            if (b.status === 'Cancelled' || b.status === 'Completed') {
                console.log('  → Skipped (cancelled/completed)');
                return;
            }

            const checkIn = new Date(b.checkIn);
            const checkOut = new Date(b.checkOut);

            const start = new Date(
                checkIn.getFullYear(),
                checkIn.getMonth(),
                checkIn.getDate()
            );
            const end = new Date(
                checkOut.getFullYear(),
                checkOut.getMonth(),
                checkOut.getDate()
            );

            const current = new Date(start);
            while (current < end) {
                const y = current.getFullYear();
                const m = String(current.getMonth() + 1).padStart(2, '0');
                const d = String(current.getDate()).padStart(2, '0');
                bookedDates.push(`${y}-${m}-${d}`);
                current.setDate(current.getDate() + 1);
            }
        });

        const uniqueDates = [...new Set(bookedDates)].sort();
        console.log('✅ Final booked dates:', uniqueDates);
        console.log('=== END ===');

        res.json({
            success: true,
            bookedDates: uniqueDates,
        });
    } catch (error) {
        console.error('❌ getBookedDates error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// ============================================
// EXPORTS
// ============================================
module.exports = {
    createBooking,
    getMyBookings,
    getBookingById,
    downloadInvoice,
    requestCancellation,
    getBookedDates,
};