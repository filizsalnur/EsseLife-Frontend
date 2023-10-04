import axios from 'axios';

const baseURL = "http://localhost:8080"; // Sunucu adresi burada belirtilmeli

const api = axios.create({
    baseURL,
    withCredentials: true,
});

export const fetcherForGet = (url: string) => api.get(url).then((response) => response.data);

export const fetcherForPost = (url: string) => api.post(url).then((response) => response.data);
export default api;