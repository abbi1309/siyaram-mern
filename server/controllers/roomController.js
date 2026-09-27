const Room = require('../models/Room');
const Booking = require('../models/Booking');

// ==================== HELPERS ====================
// Date ko "YYYY-MM-DD" local string me convert karo
const toDateStr = (date) => {
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

// Aaj ki date string (local)
const todayStr = () => toDateStr(new Date());

// Check karo booking aaj ke date range me hai ya nahi (inclusive)
const isBookingActiveToday = (booking) => {
    // Checked-In always occupied
    if (booking.status === 'Checked-In') return true;

    // Confirmed — date range check
    if (booking.status === 'Confirmed') {
        const ci = toDateStr(booking.checkIn);
        const co = toDateStr(booking.checkOut);
        const t = todayStr();

        // Aaj checkIn aur checkOut ke beech (dono inclusive)
        return t >= ci && t <= co;
    }

    return false;
};

// ==================== GET ALL ROOMS ====================
const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find({ isActive: true }).sort({ roomNumber: 1 });

        // Active bookings dhundo
        const activeBookings = await Booking.find({
            status: { $in: ['Confirmed', 'Checked-In'] },
        }).select('room checkIn checkOut status');

        // Kaunse rooms occupied hain
        const occupiedRoomIds = new Set();

        activeBookings.forEach((b) => {
            if (isBookingActiveToday(b)) {
                occupiedRoomIds.add(b.room.toString());
            }
        });

        // Har room ka status set karo
        const roomsWithStatus = rooms.map((room) => {
            const roomObj = room.toObject();

            // Maintenance / Cleaning ko chhodo
            if (room.status === 'Maintenance' || room.status === 'Cleaning') {
                return roomObj;
            }

            roomObj.status = occupiedRoomIds.has(room._id.toString())
                ? 'Occupied'
                : 'Available';

            return roomObj;
        });

        const stats = {
            total: roomsWithStatus.length,
            available: roomsWithStatus.filter((r) => r.status === 'Available').length,
            occupied: roomsWithStatus.filter((r) => r.status === 'Occupied').length,
            maintenance: roomsWithStatus.filter((r) => r.status === 'Maintenance').length,
            cleaning: roomsWithStatus.filter((r) => r.status === 'Cleaning').length,
        };

        res.json({
            success: true,
            count: roomsWithStatus.length,
            rooms: roomsWithStatus,
            stats,
        });
    } catch (error) {
        console.error('getAllRooms error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== GET ROOM BY ID ====================
const getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        // Aaj ke liye koi active booking hai?
        const activeBookings = await Booking.find({
            room: room._id,
            status: { $in: ['Confirmed', 'Checked-In'] },
        });

        const isOccupied = activeBookings.some((b) => isBookingActiveToday(b));

        const roomObj = room.toObject();
        if (roomObj.status !== 'Maintenance' && roomObj.status !== 'Cleaning') {
            roomObj.status = isOccupied ? 'Occupied' : 'Available';
        }

        res.json({ success: true, room: roomObj });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== SEARCH ROOMS ====================
const searchRooms = async (req, res) => {
    try {
        const { checkIn, checkOut, guests, roomType, minPrice, maxPrice } = req.query;

        let query = { isActive: true, status: { $ne: 'Maintenance' } };

        if (roomType) query.roomType = roomType;
        if (minPrice || maxPrice) {
            query.pricePerNight = {};
            if (minPrice) query.pricePerNight.$gte = Number(minPrice);
            if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
        }
        if (guests) query.maxGuests = { $gte: Number(guests) };

        let rooms = await Room.find(query);

        if (checkIn && checkOut) {
            const bookedRooms = await Booking.find({
                status: { $in: ['Confirmed', 'Checked-In', 'Pending'] },
                $or: [
                    {
                        checkIn: { $lte: new Date(checkOut) },
                        checkOut: { $gte: new Date(checkIn) },
                    },
                ],
            }).select('room');

            const bookedIds = bookedRooms.map((b) => b.room.toString());
            rooms = rooms.filter((r) => !bookedIds.includes(r._id.toString()));
        }

        res.json({ success: true, count: rooms.length, rooms });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== SEARCH AVAILABLE ROOMS ====================
const searchAvailableRooms = async (req, res) => {
    try {
        const { checkIn, checkOut, guests } = req.query;

        // Basic filter
        let query = { isActive: true };
        if (guests) {
            query.capacity = { $gte: parseInt(guests) };
        }

        const allRooms = await Room.find(query).sort({ roomNumber: 1 });

        // Agar dates nahi di gayi — sab rooms Available dikhao
        if (!checkIn || !checkOut) {
            const roomsWithStatus = allRooms.map((room) => ({
                ...room.toObject(),
                isAvailableForDates: true,
                status: room.status === 'Maintenance' ? 'Maintenance' : 'Available',
            }));

            return res.json({
                success: true,
                rooms: roomsWithStatus,
                filtered: false,
                totalFound: roomsWithStatus.length,
            });
        }

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

        // Overlap check — jo bhi booking in dates pe overlap karti hai
        const conflictingBookings = await Booking.find({
            status: { $nin: ['Cancelled', 'Completed'] },
            checkIn: { $lt: checkOutDate },
            checkOut: { $gt: checkInDate },
        }).select('room');

        const bookedRoomIds = new Set(
            conflictingBookings.map((b) => b.room.toString())
        );

        // Saare rooms return karo — booked wale marked as unavailable
        const roomsWithStatus = allRooms.map((room) => {
            const roomObj = room.toObject();
            const isBooked = bookedRoomIds.has(room._id.toString());
            const isMaintenance = room.status === 'Maintenance';

            roomObj.isAvailableForDates = !isBooked && !isMaintenance;
            roomObj.status = isMaintenance
                ? 'Maintenance'
                : isBooked
                ? 'Booked'
                : 'Available';

            return roomObj;
        });

        const availableCount = roomsWithStatus.filter(
            (r) => r.isAvailableForDates
        ).length;

        res.json({
            success: true,
            rooms: roomsWithStatus,
            filtered: true,
            totalFound: availableCount,
            totalRooms: allRooms.length,
            dateRange: { checkIn, checkOut },
        });
    } catch (error) {
        console.error('searchAvailableRooms error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// ==================== CHECK-OUT ====================
const checkOutBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        if (booking.status === 'Completed') {
            return res.status(400).json({
                success: false,
                message: 'Booking already completed',
            });
        }

        booking.status = 'Completed';
        booking.checkedOutAt = new Date();
        await booking.save();

        res.json({
            success: true,
            message: 'Check-out successful. Room is now available.',
            booking,
        });
    } catch (error) {
        console.error('checkOutBooking error:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};







// ==================== CREATE ROOM ====================
const createRoom = async (req, res) => {
    try {
        const {
            roomNumber,
            roomType,
            floor,
            pricePerNight,
            maxGuests,
            bedType,
            roomSize,
            view,
            amenities,
            status,
        } = req.body;

        if (!roomNumber || !roomType) {
            return res.status(400).json({
                success: false,
                message: 'Room number and type required',
            });
        }

        // Duplicate check
        const existing = await Room.findOne({ roomNumber });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: `Room ${roomNumber} already exists`,
            });
        }

        const room = await Room.create({
            roomNumber,
            roomType,
            floor: floor || 1,
            pricePerNight: pricePerNight || 1500,
            maxGuests: maxGuests || 2,
            bedType: bedType || 'Double Bed',
            roomSize: roomSize || 28,
            view: view || 'City View',
            amenities: amenities || {
                ac: true,
                wifi: true,
                tv: true,
                breakfast: false,
            },
            status: status || 'Available',
            isActive: true,
        });

        res.status(201).json({ success: true, room });
    } catch (err) {
        console.error('createRoom error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// ==================== UPDATE ROOM ====================
const updateRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found',
            });
        }

        const fields = [
            'roomNumber',
            'roomType',
            'floor',
            'pricePerNight',
            'maxGuests',
            'bedType',
            'roomSize',
            'view',
            'amenities',
            'status',
            'isActive',
        ];

        fields.forEach((f) => {
            if (req.body[f] !== undefined) {
                room[f] = req.body[f];
            }
        });

        await room.save();
        res.json({ success: true, room });
    } catch (err) {
        console.error('updateRoom error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};

// ==================== DELETE ROOM ====================
const deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found',
            });
        }

        // Soft delete — isActive false karo
        room.isActive = false;
        await room.save();

        res.json({
            success: true,
            message: 'Room deactivated',
        });
    } catch (err) {
        console.error('deleteRoom error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};



// ==================== CHECK ANY ROOM AVAILABLE ====================
const checkAnyAvailable = async (req, res) => {
    try {
        const { checkIn, checkOut } = req.query;

        if (!checkIn || !checkOut) {
            return res.status(400).json({
                success: false,
                message: 'checkIn and checkOut required',
            });
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (
            isNaN(checkInDate) ||
            isNaN(checkOutDate) ||
            checkInDate >= checkOutDate
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid dates',
            });
        }

        // Total active rooms
        const allRooms = await Room.find({
            isActive: true,
            status: { $ne: 'Maintenance' },
        });

        // Booked rooms in these dates
        const conflictingBookings = await Booking.find({
            status: { $nin: ['Cancelled', 'Completed'] },
            checkIn: { $lt: checkOutDate },
            checkOut: { $gt: checkInDate },
        }).select('room');

        const bookedIds = conflictingBookings.map((b) =>
            b.room.toString()
        );

        const availableCount = allRooms.filter(
            (r) => !bookedIds.includes(r._id.toString())
        ).length;

        res.json({
            success: true,
            available: availableCount > 0,
            availableCount,
            totalRooms: allRooms.length,
            message:
                availableCount > 0
                    ? `${availableCount} rooms available`
                    : 'No rooms available for these dates',
        });
    } catch (error) {
        console.error('checkAnyAvailable error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};




module.exports = {
    getAllRooms,
    getRoomById,
    searchRooms,
    searchAvailableRooms,
    checkOutBooking,
    checkAnyAvailable,       // agar hai to
    createRoom,              // 👈 ye
    updateRoom,              // 👈 ye
    deleteRoom,              // 👈 ye
};