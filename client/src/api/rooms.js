 
import API from './axios';

export const getAllRooms = async () => {
    const { data } = await API.get('/rooms');
    return data;
};

export const getRoomById = async (id) => {
    const { data } = await API.get(`/rooms/${id}`);
    return data;
};

export const searchRooms = async (params) => {
    const { data } = await API.get('/rooms/search', { params });
    return data;
};


// ==================== SEARCH AVAILABLE ROOMS ====================
export const searchAvailableRooms = async ({ checkIn, checkOut, guests }) => {
    const params = {};
    if (checkIn) params.checkIn = checkIn;
    if (checkOut) params.checkOut = checkOut;
    if (guests) params.guests = guests;

    const { data } = await API.get('/rooms/search', { params });
    return data;
};