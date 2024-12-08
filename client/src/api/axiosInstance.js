import axios from "axios";
import { useApplicationStore } from "../store/application.store";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = useApplicationStore.getState().token;
  if (token && !config.url.includes('/check-username')) {
    if (!config.headers['Authorization']) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
}
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      useApplicationStore.getState().logout(); // Brisanje tokena i korisnika
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
