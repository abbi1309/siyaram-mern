 
import API from './axios';

export const sendMessage = async (message) => {
    const { data } = await API.post('/chat', { message });
    return data;
};