 
const Room = require('../models/Room');

async function initializeRooms() {
    try {
        const count = await Room.countDocuments();
        if (count >= 12) {
            console.log(`${count} rooms already exist`);
            return;
        }

        await Room.deleteMany({});
        console.log('Cleared old rooms');

        const rooms = [];
        // GROUND FLOOR (5 rooms: 201-205)
        for (let i = 1; i <= 5; i++) {
            rooms.push({
                roomNumber: '1' + String(i).padStart(2, '0'),
                roomType: 'Deluxe Room',
                floor: 1,
                pricePerNight: 1500,
                maxGuests: 2,
                bedType: 'Double Bed',
                roomSize: 28,
                view: i <= 3 ? 'City View' : 'Garden View',
                status: 'Available'
            });
        }
        // FIRST FLOOR (7 rooms: 206-212
        for (let i = 1; i <= 7; i++) {
            rooms.push({
                roomNumber: '2' + String(i).padStart(2, '0'),
                roomType: 'Executive Suite',
                floor: 2,
                pricePerNight: 2500,
                maxGuests: 3,
                bedType: i % 2 === 0 ? 'Twin Bed' : 'King Bed',
                roomSize: 35,
                view: 'City View',
                status: 'Available',
                amenities: {
                    ac: true, wifi: true, attachedBathroom: true, tv: true,
                    hotWater: true, roomService: true, dailyCleaning: true,
                    powerBackup: true, breakfast: true, parking: true
                }
            });
        }

        await Room.insertMany(rooms);
        console.log(`${rooms.length} rooms created successfully!`);
        console.log(`   Ground Floor: 5 Deluxe Rooms (Rs 1500/night)`);
        console.log(`   First Floor: 7  Deluxe Rooms (Rs 1500/night)`);
        } catch (error) {
        console.error('Room init error:', error.message);
    }
}

module.exports = initializeRooms;