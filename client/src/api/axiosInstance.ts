import axios from "axios";
import { useAuthStore } from "../store/application.store";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
});

axiosInstance.interceptors.request.use((config) => {
  const { user } = useAuthStore.getState(); 
  const token = user?.token; 

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout(); 
      window.location.href = "/login"; 
    }
    return Promise.reject(error); 
  }
);

export default axiosInstance;
