import axios from "axios";

export const axiosGuest = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosGuest.interceptors.request.use(
  (config) => {
    // FormData ile dosya gönderirken Content-Type'ı bırakma; tarayıcı multipart/form-data + boundary atayacak.
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosGuest.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log(error.response?.data ?? error);
    return Promise.reject(error);
  }
);

export default axiosGuest;
