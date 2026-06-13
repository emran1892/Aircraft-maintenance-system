import axios from 'axios';

//Backend base URL
const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: যেকোনো এপিআই রিকোয়েস্ট ব্যাকএন্ডে রওনা দেওয়ার আগে,
// এই ফাংশনটি ব্রাউজারের পকেট (localStorage) থেকে টোকেনটি নিয়ে হেডার-এ বসিয়ে দেবে।
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // ব্যাকএন্ডের authMiddleware এই Authorization হেডারটিই রিড করে
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;