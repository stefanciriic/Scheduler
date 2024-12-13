import axios from "axios";
import { useAuthStore } from "../store/application.store";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
});

axiosInstance.interceptors.request.use((config) => {
  const { user } = useAuthStore.getState(); // Izvlači user iz stanja
  const token = user?.token; // Proverava da li user postoji i ima token

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`, // Dodaje token u Authorization zaglavlje
    };
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout(); // Poziva logout funkciju iz store-a
      window.location.href = "/login"; // Preusmerava na login stranicu
    }
    return Promise.reject(error); // Prosleđuje grešku za dalje rukovanje
  }
);

export default axiosInstance;
