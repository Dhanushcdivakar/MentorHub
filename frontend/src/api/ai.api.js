import api from "./axios";

export const getAIChatSessions = async () => {
  const response = await api.get("/api/mentorship/ai/sessions");
  return response.data;
};

export const createAIChatSession = async (title) => {
  const response = await api.post("/api/mentorship/ai/sessions", { title });
  return response.data;
};

export const getAIChatSessionDetails = async (sessionId) => {
  const response = await api.get(`/api/mentorship/ai/sessions/${sessionId}`);
  return response.data;
};

export const sendAIChatMessage = async (sessionId, message) => {
  const response = await api.post(`/api/mentorship/ai/sessions/${sessionId}/message`, {
    message,
  });
  return response.data;
};

export const deleteAIChatSession = async (sessionId) => {
  const response = await api.delete(`/api/mentorship/ai/sessions/${sessionId}`);
  return response.data;
};
