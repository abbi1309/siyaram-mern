// ============================================
// INITIALIZE ROOMS
// 12 Deluxe Rooms
// Ground: 201-205 (5) | 1st Floor: 206-212 (7)
// ============================================

const Room = require('../models/Room');

const initializeRooms = async () => {
    try {
        const existingCount = await Room.countDocuments();

        if (existingCount > 0) {
            console.log(`ℹ️ ${existingCount} rooms already exist — skipping init`);
            return;
        }

        // Default amenities
        const defaultAmenities = {
            ac: true,
            wifi: true,
            attachedBathroom: true,
            tv: true,
            hotWater: true,
            roomService: true,
            dailyCleaning: true,
            powerBackup: true,
            // breakfast: true,
            parking: true,
        };

        // ============================================
        // GROUND FLOOR (5 rooms: 201-205)
        // ============================================
        const groundFloorRooms = [];
        for (let i = 1; i <= 5; i++) {
            groundFloorRooms.push({
                roomNumber: `20${i}`,       // 201, 202, 203, 204, 205
                roomType: 'Deluxe Room',
                floor: 0,
                pricePerNight: 1500,
                maxGuests: 4,
                bedType: 'Double Bed',
                roomSize: 28,
                // view: '',                    // No view
                description: 'Modern, spacious room with premium amenities.',
                images: [],
                amenities: defaultAmenities,
                status: 'Available',
                isActive: true,
            });
        }

        // ============================================
        // FIRST FLOOR (7 rooms: 206-209)
        // ============================================
        const firstFloorRooms = [];
        for (let i = 6; i <= 9; i++) {
            firstFloorRooms.push({
                roomNumber: `20${i}`,       // 206, 207, 208, ..., 212
                roomType: 'Deluxe Room',
                floor: 1,
                pricePerNight: 1500,
                maxGuests: 4,
                bedType: 'Double Bed',
                roomSize: 28,
                // view: '',                    // No view
                description: 'Modern, spacious room with premium amenities.',
                images: [],
                amenities: defaultAmenities,
                status: 'Available',
                isActive: true,
            });
        }

         // ============================================
        // FIRST FLOOR (7 rooms: 210-212)
        // ============================================
        // const firstFloorRooms = [];
        for (let i = 10; i <= 12; i++) {
            firstFloorRooms.push({
                roomNumber: `2${i}`,       // 206, 207, 208, ..., 212
                roomType: 'Deluxe Room',
                floor: 1,
                pricePerNight: 1500,
                maxGuests: 4,
                bedType: 'Double Bed',
                roomSize: 28,
                // view: '',                    // No view
                description: 'Modern, spacious room with premium amenities.',
                images: [],
                amenities: defaultAmenities,
                status: 'Available',
                isActive: true,
            });
        }

        const allRooms = [...groundFloorRooms, ...firstFloorRooms];

        await Room.insertMany(allRooms);

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ 12 Deluxe Rooms created:');
        console.log('   Ground Floor: 5 rooms (201-205)');
        console.log('   First Floor: 7 rooms (206-212)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } catch (error) {
        console.error('❌ Room initialization failed:', error.message);
    }
};

module.exports = initializeRooms;