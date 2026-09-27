// import { useState } from 'react';

// function BookingCalendar({ bookedDates = [], checkIn, checkOut, onSelect }) {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const [viewMonth, setViewMonth] = useState(
//         new Date(today.getFullYear(), today.getMonth(), 1)
//     );
//     const [hoverDate, setHoverDate] = useState(null);

//     // Format date as YYYY-MM-DD
//     const fmt = (d) => {
//         const y = d.getFullYear();
//         const m = String(d.getMonth() + 1).padStart(2, '0');
//         const day = String(d.getDate()).padStart(2, '0');
//         return `${y}-${m}-${day}`;
//     };

//     const isBooked = (dateStr) => bookedDates.includes(dateStr);
//     const isPast = (date) => date < today;
//     const isToday = (date) => fmt(date) === fmt(today);

//     // Generate calendar grid
//     const year = viewMonth.getFullYear();
//     const month = viewMonth.getMonth();

//     const firstDay = new Date(year, month, 1);
//     const startingDay = firstDay.getDay(); // 0 = Sunday
//     const daysInMonth = new Date(year, month + 1, 0).getDate();

//     const cells = [];
//     for (let i = 0; i < startingDay; i++) cells.push(null);
//     for (let d = 1; d <= daysInMonth; d++) {
//         cells.push(new Date(year, month, d));
//     }

//     const monthNames = [
//         'January', 'February', 'March', 'April', 'May', 'June',
//         'July', 'August', 'September', 'October', 'November', 'December',
//     ];
//     const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

//     // Prev / Next month
//     const prevMonth = () => {
//         const prev = new Date(year, month - 1, 1);
//         // Don't go before current month
//         if (prev.getFullYear() < today.getFullYear()) return;
//         if (
//             prev.getFullYear() === today.getFullYear() &&
//             prev.getMonth() < today.getMonth()
//         )
//             return;
//         setViewMonth(prev);
//     };

//     const nextMonth = () => {
//         setViewMonth(new Date(year, month + 1, 1));
//     };

//     // Handle date click
//     const handleClick = (date) => {
//         const dateStr = fmt(date);
//         if (isPast(date) || isBooked(dateStr)) return;

//         // If no checkIn OR both are set → start fresh
//         if (!checkIn || (checkIn && checkOut)) {
//             onSelect(dateStr, '');
//         } else {
//             // checkIn is set, we're setting checkOut
//             if (dateStr <= checkIn) {
//                 // Clicked before checkIn → reset
//                 onSelect(dateStr, '');
//             } else {
//                 // Set checkout — but first verify no booked date in between
//                 onSelect(checkIn, dateStr);
//             }
//         }
//     };

//     // Range check
//     const isInRange = (date) => {
//         if (!checkIn || !checkOut) return false;
//         const d = fmt(date);
//         return d > checkIn && d < checkOut;
//     };

//     const isCheckIn = (date) => fmt(date) === checkIn;
//     const isCheckOut = (date) => fmt(date) === checkOut;

//     return (
//         <div
//             style={{
//                 background: 'white',
//                 padding: 20,
//                 borderRadius: 16,
//                 marginBottom: 20,
//                 border: '1px solid #E5E7EB',
//             }}
//         >
//             <div style={{ marginBottom: 16 }}>
//                 <h3
//                     style={{
//                         fontSize: 16,
//                         fontWeight: 700,
//                         color: 'var(--navy)',
//                         margin: 0,
//                         marginBottom: 4,
//                     }}
//                 >
//                     📅 Select Your Dates
//                 </h3>
//                 <p
//                     style={{
//                         fontSize: 12,
//                         color: 'var(--text-muted)',
//                         margin: 0,
//                     }}
//                 >
//                     Green dates available hain, red dates already booked hain
//                 </p>
//             </div>

//             {/* Legend */}
//             <div
//                 style={{
//                     display: 'flex',
//                     gap: 16,
//                     marginBottom: 16,
//                     flexWrap: 'wrap',
//                     fontSize: 11,
//                     fontWeight: 600,
//                 }}
//             >
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//                     <span
//                         style={{
//                             width: 14,
//                             height: 14,
//                             borderRadius: 4,
//                             background: '#DCFCE7',
//                             border: '1px solid #22C55E',
//                         }}
//                     ></span>
//                     <span style={{ color: '#166534' }}>Available</span>
//                 </div>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//                     <span
//                         style={{
//                             width: 14,
//                             height: 14,
//                             borderRadius: 4,
//                             background: '#FEE2E2',
//                             border: '1px solid #DC2626',
//                         }}
//                     ></span>
//                     <span style={{ color: '#991B1B' }}>Booked</span>
//                 </div>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//                     <span
//                         style={{
//                             width: 14,
//                             height: 14,
//                             borderRadius: 4,
//                             background: '#D4AF37',
//                         }}
//                     ></span>
//                     <span style={{ color: '#92400E' }}>Selected</span>
//                 </div>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//                     <span
//                         style={{
//                             width: 14,
//                             height: 14,
//                             borderRadius: 4,
//                             background: '#F3F4F6',
//                             border: '1px solid #E5E7EB',
//                         }}
//                     ></span>
//                     <span style={{ color: '#9CA3AF' }}>Past</span>
//                 </div>
//             </div>

//             {/* Month Nav */}
//             <div
//                 style={{
//                     display: 'flex',
//                     justifyContent: 'space-between',
//                     alignItems: 'center',
//                     marginBottom: 12,
//                 }}
//             >
//                 <button
//                     onClick={prevMonth}
//                     style={{
//                         width: 32,
//                         height: 32,
//                         borderRadius: 8,
//                         border: '1px solid #E5E7EB',
//                         background: 'white',
//                         cursor: 'pointer',
//                         fontSize: 14,
//                         fontWeight: 700,
//                         color: 'var(--navy)',
//                     }}
//                 >
//                     ‹
//                 </button>
//                 <span
//                     style={{
//                         fontWeight: 800,
//                         fontSize: 15,
//                         color: 'var(--navy)',
//                     }}
//                 >
//                     {monthNames[month]} {year}
//                 </span>
//                 <button
//                     onClick={nextMonth}
//                     style={{
//                         width: 32,
//                         height: 32,
//                         borderRadius: 8,
//                         border: '1px solid #E5E7EB',
//                         background: 'white',
//                         cursor: 'pointer',
//                         fontSize: 14,
//                         fontWeight: 700,
//                         color: 'var(--navy)',
//                     }}
//                 >
//                     ›
//                 </button>
//             </div>

//             {/* Day Names */}
//             <div
//                 style={{
//                     display: 'grid',
//                     gridTemplateColumns: 'repeat(7, 1fr)',
//                     gap: 4,
//                     marginBottom: 6,
//                 }}
//             >
//                 {dayNames.map((d) => (
//                     <div
//                         key={d}
//                         style={{
//                             textAlign: 'center',
//                             fontSize: 10,
//                             fontWeight: 700,
//                             color: 'var(--text-muted)',
//                             padding: 4,
//                             textTransform: 'uppercase',
//                         }}
//                     >
//                         {d}
//                     </div>
//                 ))}
//             </div>

//             {/* Dates Grid */}
//             <div
//                 style={{
//                     display: 'grid',
//                     gridTemplateColumns: 'repeat(7, 1fr)',
//                     gap: 4,
//                 }}
//             >
//                 {cells.map((date, idx) => {
//                     if (!date)
//                         return <div key={`empty-${idx}`} style={{ height: 40 }} />;

//                     const dateStr = fmt(date);
//                     const booked = isBooked(dateStr);
//                     const past = isPast(date);
//                     const todayCell = isToday(date);
//                     const selectedIn = isCheckIn(date);
//                     const selectedOut = isCheckOut(date);
//                     const inRange = isInRange(date);

//                     const isSelected = selectedIn || selectedOut;

//                     let bg = 'white';
//                     let color = 'var(--navy)';
//                     let border = '1px solid #E5E7EB';
//                     let cursor = 'pointer';
//                     let textDecoration = 'none';

//                     if (past) {
//                         bg = '#F3F4F6';
//                         color = '#9CA3AF';
//                         cursor = 'not-allowed';
//                     } else if (booked) {
//                         bg = '#FEE2E2';
//                         color = '#991B1B';
//                         cursor = 'not-allowed';
//                         border = '1px solid #FCA5A5';
//                     } else if (isSelected) {
//                         bg = 'linear-gradient(135deg, #D4AF37, #B8912E)';
//                         color = '#fff';
//                         border = '1px solid #B8912E';
//                     } else if (inRange) {
//                         bg = '#FEF9E6';
//                         color = 'var(--navy)';
//                     }

//                     return (
//                         <button
//                             key={dateStr}
//                             onClick={() => handleClick(date)}
//                             disabled={past || booked}
//                             title={
//                                 past
//                                     ? 'Past date'
//                                     : booked
//                                     ? 'Already booked'
//                                     : 'Click to select'
//                             }
//                             style={{
//                                 height: 40,
//                                 borderRadius: 8,
//                                 background: bg,
//                                 color,
//                                 border,
//                                 cursor,
//                                 fontSize: 13,
//                                 fontWeight: todayCell || isSelected ? 800 : 600,
//                                 transition: 'all 0.15s',
//                                 textDecoration,
//                                 position: 'relative',
//                             }}
//                             onMouseEnter={(e) => {
//                                 if (!past && !booked && !isSelected) {
//                                     e.currentTarget.style.transform = 'scale(1.08)';
//                                     e.currentTarget.style.borderColor = '#D4AF37';
//                                 }
//                             }}
//                             onMouseLeave={(e) => {
//                                 e.currentTarget.style.transform = 'scale(1)';
//                                 if (!past && !booked && !isSelected) {
//                                     e.currentTarget.style.borderColor = '#E5E7EB';
//                                 }
//                             }}
//                         >
//                             {date.getDate()}
//                             {todayCell && !isSelected && (
//                                 <span
//                                     style={{
//                                         position: 'absolute',
//                                         bottom: 3,
//                                         left: '50%',
//                                         transform: 'translateX(-50%)',
//                                         width: 4,
//                                         height: 4,
//                                         borderRadius: '50%',
//                                         background: '#D4AF37',
//                                     }}
//                                 ></span>
//                             )}
//                         </button>
//                     );
//                 })}
//             </div>

//             {/* Selection info */}
//             {checkIn && (
//                 <div
//                     style={{
//                         marginTop: 16,
//                         padding: '10px 14px',
//                         background: '#F0F9FF',
//                         border: '1px solid #BAE6FD',
//                         borderRadius: 10,
//                         fontSize: 12,
//                         color: '#075985',
//                         fontWeight: 600,
//                     }}
//                 >
//                     {checkIn && !checkOut && (
//                         <>
//                             📌 Check-in selected: <strong>{checkIn}</strong>
//                             <br />
//                             <span style={{ fontSize: 11, fontWeight: 500 }}>
//                                 Ab check-out date click karein
//                             </span>
//                         </>
//                     )}
//                     {checkIn && checkOut && (
//                         <>
//                             ✅ Selected: <strong>{checkIn}</strong> →{' '}
//                             <strong>{checkOut}</strong>
//                         </>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// }

// export default BookingCalendar;







import { useState } from 'react';

function BookingCalendar({ bookedDates = [], checkIn, checkOut, onSelect }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [viewMonth, setViewMonth] = useState(
        new Date(today.getFullYear(), today.getMonth(), 1)
    );

    // Format date as YYYY-MM-DD
    const fmt = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const isBookedNight = (dateStr) => bookedDates.includes(dateStr);
    const isPast = (date) => date < today;
    const isToday = (date) => fmt(date) === fmt(today);

    // Month days
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startingDay = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < startingDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push(new Date(year, month, d));
    }

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const prevMonth = () => {
        const prev = new Date(year, month - 1, 1);
        if (
            prev.getFullYear() < today.getFullYear() ||
            (prev.getFullYear() === today.getFullYear() &&
                prev.getMonth() < today.getMonth())
        )
            return;
        setViewMonth(prev);
    };

    const nextMonth = () => {
        setViewMonth(new Date(year, month + 1, 1));
    };

    // ────────── MAIN LOGIC ──────────
    // Can a date be clicked?
    const canClick = (date) => {
    if (isPast(date)) return false;

    const dateStr = fmt(date);
    const isBooked = isBookedNight(dateStr);

    // Case 1: No checkIn OR both selected → we're choosing new checkIn
    if (!checkIn || (checkIn && checkOut)) {
        return !isBooked;
    }

    // Case 2: checkIn set, checkOut not yet set
    // If clicked date is BEFORE or EQUAL to checkIn → allow reset (if not booked)
    if (dateStr <= checkIn) {
        return !isBooked;
    }

    // Case 3: Clicked date is AFTER checkIn → checking for checkout
    // Valid if no booked night exists in [checkIn, clickedDate)
    const start = new Date(checkIn);
    start.setHours(0, 0, 0, 0);

    return !bookedDates.some((d) => {
        const dt = new Date(d);
        dt.setHours(0, 0, 0, 0);
        return dt >= start && dt < date;
    });
};

    const handleClick = (date) => {
        if (!canClick(date)) return;

        const dateStr = fmt(date);

        // If no checkIn OR both are set → start fresh
        if (!checkIn || (checkIn && checkOut)) {
            onSelect(dateStr, '');
        } else {
            // checkIn is set, we're setting checkOut
            if (dateStr <= checkIn) {
                onSelect(dateStr, '');
            } else {
                onSelect(checkIn, dateStr);
            }
        }
    };

    // Range helpers
    const isInRange = (date) => {
        if (!checkIn || !checkOut) return false;
        const d = fmt(date);
        return d > checkIn && d < checkOut;
    };

    const isCheckIn = (date) => fmt(date) === checkIn;
    const isCheckOut = (date) => fmt(date) === checkOut;

    return (
        <div
            className="booking-calendar"
            style={{
                background: 'white',
                padding: 20,
                borderRadius: 16,
                marginBottom: 20,
                border: '1px solid #E5E7EB',
            }}
        >
            <div style={{ marginBottom: 16 }}>
                <h3
                    style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: 'var(--navy)',
                        margin: 0,
                        marginBottom: 4,
                    }}
                >
                    📅 Select Your Dates
                </h3>
                <p
                    style={{
                        fontSize: 12,
                        color: 'var(--text-muted)',
                        margin: 0,
                    }}
                >
                    Green dates available hain, red dates booked hain
                </p>
            </div>

            {/* Legend */}
            <div
                style={{
                    display: 'flex',
                    gap: 16,
                    marginBottom: 16,
                    flexWrap: 'wrap',
                    fontSize: 11,
                    fontWeight: 600,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                        style={{
                            width: 14,
                            height: 14,
                            borderRadius: 4,
                            background: '#DCFCE7',
                            border: '1px solid #22C55E',
                        }}
                    ></span>
                    <span style={{ color: '#166534' }}>Available</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                        style={{
                            width: 14,
                            height: 14,
                            borderRadius: 4,
                            background: '#FEE2E2',
                            border: '1px solid #DC2626',
                        }}
                    ></span>
                    <span style={{ color: '#991B1B' }}>Booked</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                        style={{
                            width: 14,
                            height: 14,
                            borderRadius: 4,
                            background: '#D4AF37',
                        }}
                    ></span>
                    <span style={{ color: '#92400E' }}>Selected</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                        style={{
                            width: 14,
                            height: 14,
                            borderRadius: 4,
                            background: '#F3F4F6',
                            border: '1px solid #E5E7EB',
                        }}
                    ></span>
                    <span style={{ color: '#9CA3AF' }}>Past</span>
                </div>
            </div>

            {/* Month Nav */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                }}
            >
                <button
                    onClick={prevMonth}
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        border: '1px solid #E5E7EB',
                        background: 'white',
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 700,
                        color: 'var(--navy)',
                    }}
                >
                    ‹
                </button>
                <span
                    style={{
                        fontWeight: 800,
                        fontSize: 15,
                        color: 'var(--navy)',
                    }}
                >
                    {monthNames[month]} {year}
                </span>
                <button
                    onClick={nextMonth}
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        border: '1px solid #E5E7EB',
                        background: 'white',
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 700,
                        color: 'var(--navy)',
                    }}
                >
                    ›
                </button>
            </div>

            {/* Day Names */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: 4,
                    marginBottom: 6,
                }}
            >
                {dayNames.map((d) => (
                    <div
                        key={d}
                        style={{
                            textAlign: 'center',
                            fontSize: 10,
                            fontWeight: 700,
                            color: 'var(--text-muted)',
                            padding: 4,
                            textTransform: 'uppercase',
                        }}
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* Dates Grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: 4,
                }}
            >
                {cells.map((date, idx) => {
                    if (!date)
                        return <div key={`empty-${idx}`} style={{ height: 40 }} />;

                    const dateStr = fmt(date);
                    const booked = isBookedNight(dateStr);
                    const past = isPast(date);
                    const todayCell = isToday(date);
                    const selectedIn = isCheckIn(date);
                    const selectedOut = isCheckOut(date);
                    const inRange = isInRange(date);
                    const clickable = canClick(date);
                    const isSelected = selectedIn || selectedOut;

                    let bg = 'white';
                    let color = 'var(--navy)';
                    let border = '1px solid #E5E7EB';
                    let cursor = 'pointer';
                    let opacity = 1;

                    if (past) {
                        bg = '#F3F4F6';
                        color = '#9CA3AF';
                        cursor = 'not-allowed';
                        opacity = 0.6;
                    } else if (isSelected) {
                        bg = 'linear-gradient(135deg, #D4AF37, #B8912E)';
                        color = '#fff';
                        border = '1px solid #B8912E';
                    } else if (inRange) {
                        bg = '#FEF9E6';
                        color = 'var(--navy)';
                    } else if (booked && !checkIn) {
                        // Booked AND we're selecting checkIn
                        bg = '#FEE2E2';
                        color = '#991B1B';
                        cursor = 'not-allowed';
                        border = '1px solid #FCA5A5';
                    } else if (booked) {
                        // Booked but checkIn already selected
                        // Check if it can be checkout
                        if (clickable) {
                            bg = '#FEF3C7';
                            color = '#92400E';
                            border = '1px dashed #F59E0B';
                            cursor = 'pointer';
                        } else {
                            bg = '#FEE2E2';
                            color = '#991B1B';
                            cursor = 'not-allowed';
                            border = '1px solid #FCA5A5';
                        }
                    } else if (!clickable) {
                        bg = '#F3F4F6';
                        color = '#9CA3AF';
                        cursor = 'not-allowed';
                        opacity = 0.5;
                    } else {
                        // Available
                        bg = '#DCFCE7';
                        color = '#166534';
                        border = '1px solid #22C55E';
                    }

                    return (
                        <button
                            key={dateStr}
                            onClick={() => handleClick(date)}
                            disabled={!clickable}
                            title={
                                past
                                    ? 'Past date'
                                    : booked
                                    ? checkIn
                                        ? 'Checkout possible on this date'
                                        : 'Already booked'
                                    : 'Click to select'
                            }
                            style={{
                                height: 40,
                                borderRadius: 8,
                                background: bg,
                                color,
                                border,
                                cursor,
                                fontSize: 13,
                                fontWeight:
                                    todayCell || isSelected ? 800 : 600,
                                transition: 'all 0.15s',
                                position: 'relative',
                                opacity,
                            }}
                        >
                            {date.getDate()}
                            {todayCell && !isSelected && (
                                <span
                                    style={{
                                        position: 'absolute',
                                        bottom: 3,
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: 4,
                                        height: 4,
                                        borderRadius: '50%',
                                        background: '#D4AF37',
                                    }}
                                ></span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Selection info */}
            {checkIn && (
                <div
                    style={{
                        marginTop: 16,
                        padding: '10px 14px',
                        background: '#F0F9FF',
                        border: '1px solid #BAE6FD',
                        borderRadius: 10,
                        fontSize: 12,
                        color: '#075985',
                        fontWeight: 600,
                    }}
                >
                    {checkIn && !checkOut && (
                        <>
                            📌 Check-in selected: <strong>{checkIn}</strong>
                            <br />
                            <span style={{ fontSize: 11, fontWeight: 500 }}>
                                Ab check-out date click karein
                            </span>
                        </>
                    )}
                    {checkIn && checkOut && (
                        <>
                            ✅ Selected: <strong>{checkIn}</strong> →{' '}
                            <strong>{checkOut}</strong>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default BookingCalendar;