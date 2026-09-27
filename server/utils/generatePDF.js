 
const PDFDocument = require('pdfkit');

function generateInvoicePDF(booking, room, user, res) {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=invoice-${booking.bookingId}.pdf`);
    doc.pipe(res);

    const NAVY = '#0A1E3F';
    const GOLD = '#D4AF37';
    const pageWidth = doc.page.width;
    const margin = 40;
    const contentWidth = pageWidth - (margin * 2);

    doc.rect(0, 0, pageWidth, 8).fill(GOLD);

    let y = 40;
    doc.fillColor(NAVY).fontSize(28).font('Helvetica-Bold').text('SIYARAM PALACE', margin, y);
    doc.fillColor('#666').fontSize(10).font('Helvetica')
       .text('Near Ram Mandir, Ayodhya, UP - 224123', margin, y + 35)
       .text('Phone: +91-9315377668', margin, y + 50);

    doc.fillColor(GOLD).roundedRect(pageWidth - margin - 140, y, 140, 30, 6).fill();
    doc.fillColor(NAVY).fontSize(14).font('Helvetica-Bold')
       .text('INVOICE', pageWidth - margin - 140, y + 8, { width: 140, align: 'center' });

    y += 100;
    doc.moveTo(margin, y).lineTo(pageWidth - margin, y).strokeColor('#e0e0e0').stroke();
    y += 20;

    doc.fillColor(NAVY).fontSize(11).font('Helvetica-Bold').text('BILL TO:', margin, y);
    doc.fillColor('#333').fontSize(10).font('Helvetica')
       .text(booking.guestName, margin, y + 18)
       .text('Phone: ' + booking.guestPhone, margin, y + 33)
       .text('Email: ' + (booking.guestEmail || user?.email || 'N/A'), margin, y + 48);

    const rx = margin + contentWidth / 2;
    doc.fillColor(NAVY).fontSize(11).font('Helvetica-Bold').text('INVOICE DETAILS:', rx, y);
    doc.fillColor('#333').fontSize(10).font('Helvetica')
       .text('Invoice No: ' + booking.bookingId, rx, y + 18)
       .text('Date: ' + new Date(booking.createdAt).toLocaleDateString('en-IN'), rx, y + 33)
       .text('Status: ' + booking.status, rx, y + 48);

    y += 100;

    doc.rect(margin, y, contentWidth, 25).fill(NAVY);
    doc.fillColor('white').fontSize(10).font('Helvetica-Bold')
       .text('ROOM', margin + 10, y + 8)
       .text('CHECK-IN', margin + 140, y + 8)
       .text('CHECK-OUT', margin + 230, y + 8)
       .text('NIGHTS', margin + 330, y + 8)
       .text('AMOUNT', margin + 420, y + 8);

    y += 25;
    doc.fillColor('#333').fontSize(10).font('Helvetica')
       .text(`${room?.roomType || 'Room'} (${room?.roomNumber || 'N/A'})`, margin + 10, y + 8)
       .text(new Date(booking.checkIn).toLocaleDateString('en-IN'), margin + 140, y + 8)
       .text(new Date(booking.checkOut).toLocaleDateString('en-IN'), margin + 230, y + 8)
       .text(String(booking.nights), margin + 330, y + 8)
       .text('Rs ' + booking.amount, margin + 420, y + 8);

    doc.rect(margin, y, contentWidth, 30).stroke('#e0e0e0');
    y += 60;

    const summaryX = pageWidth - margin - 250;
    doc.fillColor(NAVY).fontSize(12).font('Helvetica-Bold').text('PAYMENT SUMMARY', summaryX, y);
    y += 20;

    doc.fillColor('#333').fontSize(10).font('Helvetica')
       .text('Total Amount:', summaryX, y)
       .text('Rs ' + booking.amount, summaryX + 150, y, { width: 100, align: 'right' });
    y += 18;

    doc.fillColor('#27ae60')
       .text('Amount Paid:', summaryX, y)
       .text('Rs ' + (booking.paidAmount || 0), summaryX + 150, y, { width: 100, align: 'right' });

    y += 40;

    const statusColor = booking.paymentStatus === 'Paid' ? '#27ae60' : '#f59e0b';
    const statusBg = booking.paymentStatus === 'Paid' ? '#e8f5e9' : '#fef3c7';
    doc.roundedRect(pageWidth - margin - 200, y, 200, 50, 6).fillAndStroke(statusBg, statusColor);
    doc.fillColor(statusColor).fontSize(10).font('Helvetica-Bold')
       .text('PAYMENT STATUS', pageWidth - margin - 190, y + 10)
       .fontSize(16)
       .text(booking.paymentStatus.toUpperCase(), pageWidth - margin - 190, y + 22);

    const footerY = doc.page.height - 80;
    doc.rect(0, doc.page.height - 5, pageWidth, 5).fill(GOLD);
    doc.fillColor('#999').fontSize(9).font('Helvetica')
       .text('Thank you for choosing Siyaram Palace!', margin, footerY, { width: contentWidth, align: 'center' })
       .fillColor(GOLD).font('Helvetica-Bold')
       .text('www.siyarampace.in', margin, footerY + 15, { width: contentWidth, align: 'center' });

    doc.end();
}


module.exports = generateInvoicePDF;