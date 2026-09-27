 
import API from './axios';

export const getAllReviews = async (limit = 20) => {
    const { data } = await API.get('/reviews', { params: { limit } });
    return data;
};

export const getReviewStats = async () => {
    const { data } = await API.get('/reviews/stats');
    return data;
};

export const createReview = async (reviewData) => {
    const { data } = await API.post('/reviews', reviewData);
    return data;
};