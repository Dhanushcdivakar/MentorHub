import axios from "axios";
import { store } from "../redux/store";
import { setCredentials, clearCredentials } from "../redux/slices/authSlice";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor to add Authorization header
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor to handle 401 Unauthorized errors and refresh token
api.interceptors.response.use(
  (response) => {
    // Normalizing API response to return the standard data object directly if present
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh token endpoint directly using pure axios to prevent request loop.
        // It relies on the HTTP-only refreshToken cookie.
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (response.data?.success && response.data?.data?.accessToken) {
          const newAccessToken = response.data.data.accessToken;

          // Dispatch update to Redux store
          store.dispatch(
            setCredentials({
              accessToken: newAccessToken,
            })
          );

          // Update the original request's Authorization header
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refreshing token fails, log out the user
        store.dispatch(clearCredentials());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

