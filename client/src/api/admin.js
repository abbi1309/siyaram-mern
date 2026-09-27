import API from './axios';

// ==================== DASHBOARD ====================
export const getAnalytics = async () => {
    const { data } = await API.get('/admin/analytics');
    return data;
};

// ==================== BOOKINGS ====================
export const getAllBookings = async () => {
    const { data } = await API.get('/admin/bookings');
    return data;
};

export const updateBookingStatus = async (id, status) => {
    const { data } = await API.patch(`/admin/bookings/${id}/status`, { status });
    return data;
};

export const checkInBooking = async (id) => {
    const { data } = await API.post(`/admin/bookings/${id}/check-in`);
    return data;
};

export const checkOutBooking = async (id) => {
    const { data } = await API.post(`/admin/bookings/${id}/check-out`);
    return data;
};

export const confirmBooking = async (id) => {
    const { data } = await API.patch(`/admin/bookings/${id}/status`, { status: 'Confirmed' });
    return data;
};

export const cancelBooking = async (id) => {
    const { data } = await API.patch(`/admin/bookings/${id}/status`, { status: 'Cancelled' });
    return data;
};

// ==================== ROOMS ====================
export const getAllRoomsAdmin = async () => {
    const { data } = await API.get('/rooms');
    return data;
};

export const updateRoomStatus = async (id, status) => {
    const { data } = await API.patch(`/admin/rooms/${id}`, { status });
    return data;
};

// ✅ UPDATE ROOM — sirf ek baar
export const updateRoom = async (id, data) => {
    const { data: res } = await API.put(`/rooms/${id}`, data);
    return res;
};

export const createRoom = async (roomData) => {
    const { data } = await API.post('/rooms', roomData);
    return data;
};

export const deleteRoom = async (id) => {
    const { data } = await API.delete(`/rooms/${id}`);
    return data;
};

// ==================== USERS ====================
export const getAllUsers = async () => {
    const { data } = await API.get('/admin/users');
    return data;
};

// ==================== CANCEL REQUESTS ====================
export const getCancelRequests = async () => {
    const { data } = await API.get('/admin/cancel-requests');
    return data;
};

export const approveCancelRequest = async (id) => {
    const { data } = await API.post(`/admin/bookings/${id}/cancel-approve`);
    return data;
};

export const rejectCancelRequest = async (id) => {
    const { data } = await API.post(`/admin/bookings/${id}/cancel-reject`);
    return data;
};

// ==================== REVIEWS ====================
export const getAllReviewsAdmin = async () => {
    const { data } = await API.get('/admin/reviews');
    return data;
};

export const deleteReviewAdmin = async (id) => {
    const { data } = await API.delete(`/admin/reviews/${id}`);
    return data;
};

// ==================== GALLERY ====================
export const getPhotos = async () => {
    const { data } = await API.get('/admin/gallery');
    return data;
};

export const uploadPhoto = async (formData) => {
    const { data } = await API.post('/admin/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};

export const deletePhoto = async (id) => {
    const { data } = await API.delete(`/admin/gallery/${id}`);
    return data;
};

// ==================== ALIASES ====================
export const approveCancel = approveCancelRequest;
export const rejectCancel = rejectCancelRequest;
export const getAllCancelRequests = getCancelRequests;

export const checkIn = checkInBooking;
export const checkOut = checkOutBooking;
export const confirm = confirmBooking;
export const cancel = cancelBooking;
export const updateBooking = updateBookingStatus;
export const fetchBookings = getAllBookings;
export const getBookings = getAllBookings;

export const fetchRooms = getAllRoomsAdmin;
export const getRooms = getAllRoomsAdmin;

export const fetchUsers = getAllUsers;
export const getUsers = getAllUsers;

export const fetchPhotos = getPhotos;
export const getAllPhotos = getPhotos;