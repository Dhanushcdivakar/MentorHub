import { Session } from "../models/session.model.js";

export const createSession = (sessionData) => {
  return Session.create(sessionData);
};

export const findSessionById = (sessionId) => {
  return Session.findById(sessionId);
};

export const findSessionsByStudentId = (studentId, status) => {
  const query = { studentId };

  if (status) {
    query.status = status;
  }

  return Session.find(query).sort({ scheduledAt: 1 });
};

export const findSessionsByMentorId = (mentorId, status) => {
  const query = { mentorId };

  if (status) {
    query.status = status;
  }

  return Session.find(query).sort({ scheduledAt: 1 });
};

export const updateSession = (sessionId, updateData) => {
  return Session.findByIdAndUpdate(sessionId, updateData, {
    new: true,
    runValidators: true,
  });
};

export const deleteSession = (sessionId) => {
  return Session.findByIdAndDelete(sessionId);
};

export const findPendingSessionsByMentorId = (mentorId) => {
  return Session.find({
    mentorId,
    status: "pending",
  }).sort({
    createdAt: -1,
  });
};

export const findCompletedSessionsByMentorId = (mentorId) => {
  return Session.find({
    mentorId,
    status: "completed",
  }).sort({
    completedAt: -1,
  });
};

export const findCompletedSessionsByStudentId = (studentId) => {
  return Session.find({
    studentId,
    status: "completed",
  }).sort({
    completedAt: -1,
  });
};
