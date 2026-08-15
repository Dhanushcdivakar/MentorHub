import api from "./axios";

export const getMyProfileApi = async () => {
  const response = await api.get("/api/users/me");
  return response.data;
};

export const updateMyProfileApi = async (profileData) => {
  const response = await api.put("/api/users/me", profileData);
  return response.data;
};

export const getMentorsApi = async () => {
  const response = await api.get("/api/users/mentors");
  return response.data;
};

export const getUserProfileApi = async (id) => {
  const response = await api.get(`/api/users/${id}`);
  return response.data;
};

export const getUserStatsApi = async () => {
  const response = await api.get("/api/users/stats");
  return response.data;
};
