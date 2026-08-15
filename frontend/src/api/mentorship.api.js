import api from "./axios";

// Session bookings
export const createSessionApi = async (sessionData) => {
  const response = await api.post("/api/mentorship/sessions", sessionData);
  return response.data;
};

export const getStudentSessionsApi = async () => {
  const response = await api.get("/api/mentorship/sessions/student");
  return response.data;
};

export const getMentorSessionsApi = async () => {
  const response = await api.get("/api/mentorship/sessions/mentor");
  return response.data;
};

export const acceptSessionApi = async (sessionId) => {
  const response = await api.patch(`/api/mentorship/sessions/${sessionId}/accept`);
  return response.data;
};

export const rejectSessionApi = async (sessionId, rejectionReason) => {
  const response = await api.patch(`/api/mentorship/sessions/${sessionId}/reject`, {
    rejectionReason,
  });
  return response.data;
};

export const completeSessionApi = async (sessionId) => {
  const response = await api.patch(`/api/mentorship/sessions/${sessionId}/complete`);
  return response.data;
};

export const cancelSessionApi = async (sessionId) => {
  const response = await api.patch(`/api/mentorship/sessions/${sessionId}/cancel`);
  return response.data;
};

// Reviews
export const addMentorReviewApi = async (sessionId, reviewData) => {
  const response = await api.post(`/api/mentorship/reviews/${sessionId}`, reviewData);
  return response.data;
};

export const getMentorReviewsApi = async (mentorId) => {
  const response = await api.get(`/api/mentorship/reviews/mentor/${mentorId}`);
  return response.data;
};

// Dashboards
export const getStudentDashboardApi = async () => {
  const response = await api.get("/api/mentorship/dashboard/student");
  return response.data;
};

export const getMentorDashboardApi = async () => {
  const response = await api.get("/api/mentorship/dashboard/mentor");
  return response.data;
};

export const getSessionDetailsApi = async (sessionId) => {
  const response = await api.get(`/api/mentorship/sessions/${sessionId}`);
  return response.data;
};

export const getSessionTimelineApi = async (sessionId) => {
  const response = await api.get(`/api/mentorship/sessions/${sessionId}/timeline`);
  return response.data;
};

