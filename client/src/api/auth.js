import API from './axios';

export const loginUser = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    return data;
};

export const registerUser = async (userData) => {
    const { data } = await API.post('/auth/register', userData);
    return data;
};

export const getCurrentUser = async () => {
    const { data } = await API.get('/auth/me');
    return data;
};

// Forgot Password
export const forgotPassword = async (email) => {
    const { data } = await API.post('/auth/forgot-password', { email });
    return data;
};

export const verifyOtp = async (email, otp) => {
    const { data } = await API.post('/auth/verify-otp', { email, otp });
    return data;
};

export const resetPassword = async (email, resetToken, newPassword) => {
    const { data } = await API.post('/auth/reset-password', { email, resetToken, newPassword });
    return data;
};


// ==================== PASSWORD & PROFILE ====================
export const updatePassword = async (currentPassword, newPassword) => {
    const { data } = await API.put('/auth/update-password', {
        currentPassword,
        newPassword
    });
    return data;
};

export const updateProfile = async (profileData) => {
    const { data } = await API.put('/auth/update-profile', profileData);
    return data;
};