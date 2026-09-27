 
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

        for (let i = 1; i <= 6; i++) {
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

        for (let i = 1; i <= 6; i++) {
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
        console.log(`   Ground Floor: 6 Deluxe Rooms (Rs 1500/night)`);
        console.log(`   First Floor: 6 Executive Suites (Rs 2500/night)`);
    } catch (error) {
        console.error('Room init error:', error.message);
    }
}

module.exports = initializeRooms;