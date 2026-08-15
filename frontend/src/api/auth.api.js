import api from "./axios";

export const loginUserApi = async (credentials) => {
  const response = await api.post("/api/auth/login", credentials);
  return response.data;
};

export const registerUserApi = async (userData) => {
  const response = await api.post("/api/auth/register", userData);
  return response.data;
};

export const getMeApi = async () => {
  const response = await api.get("/api/auth/me");
  return response.data;
};

export const logoutUserApi = async () => {
  const response = await api.post("/api/auth/logout");
  return response.data;
};

export const forgotPasswordApi = async (email) => {
  const response = await api.post("/api/auth/forgot-password", { email });
  return response.data;
};

export const resetPasswordApi = async (token, password) => {
  const response = await api.post("/api/auth/reset-password", { token, password });
  return response.data;
};

export const googleLoginApi = async (idToken) => {
  const response = await api.post("/api/auth/google", { idToken });
  return response.data;
};


