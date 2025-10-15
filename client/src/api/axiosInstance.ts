import axios from "axios";
import { useAuthStore } from "../store/application.store";
import Toast from "../utils/toast";
import { navigate } from "../utils/navigationService";

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
      const { logout } = useAuthStore.getState();
      logout();
      
      Toast.error("Your session has expired. Please log in again.");
      
      navigate("/login");
    }
    return Promise.reject(error); 
  }
);

export default axiosInstance;
