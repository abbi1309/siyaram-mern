 
import API from './axios';

export const createBooking = async (bookingData) => {
    const { data } = await API.post('/bookings', bookingData);
    return data;
};

export const getMyBookings = async () => {
    const { data } = await API.get('/bookings/my');
    return data;
};

export const getBookingById = async (id) => {
    const { data } = await API.get(`/bookings/${id}`);
    return data;
};

export const requestCancellation = async (id, reason) => {
    const { data } = await API.post(`/bookings/${id}/cancel-request`, { reason });
    return data;
};

export const downloadInvoice = (id) => {
    return `${import.meta.env.VITE_API_URL || '/api'}/bookings/${id}/invoice`;
};