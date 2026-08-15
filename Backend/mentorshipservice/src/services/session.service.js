import AppError from "../utils/AppError.js";
import {
  createSession,
  findSessionById,
  findSessionsByStudentId,
  findSessionsByMentorId,
  updateSession,
} from "../repositories/session.repository.js";
import { createMeetingForSession } from "./meeting.service.js";

import { logSessionEvent, buildEventPayload } from "./event.service.js";

import { publishSessionCreated } from "../publishers/publishSessionCreated.js";

import { publishSessionAccepted } from "../publishers/publishSessionAccepted.js";

import { publishSessionRejected } from "../publishers/publishSessionRejected.js";

import { publishSessionCompleted } from "../publishers/publishSessionCompleted.js";

import { publishSessionCancelled } from "../publishers/publishSessionCancelled.js";

export const createNewSession = async (studentId, role, sessionData) => {
  if (role !== "student") {
    throw new AppError("Only students can create sessions", 403);
  }

  const session = await createSession({
    mentorId: sessionData.mentorId,

    studentId,

    scheduledAt: sessionData.scheduledAt,

    durationInMinutes: sessionData.durationInMinutes,

    agenda: sessionData.agenda || "",

    mentorName: sessionData.mentorName || "",

    studentName: sessionData.studentName || "",
  });

  await logSessionEvent(
    session._id,
    "SESSION_CREATED",
    buildEventPayload("SESSION_CREATED", session),
  );

  await publishSessionCreated(buildEventPayload("SESSION_CREATED", session));

  return session;
};

export const getSessionById = async (sessionId) => {
  const session = await findSessionById(sessionId);

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  return session;
};

export const getStudentSessions = async (studentId, status) => {
  return findSessionsByStudentId(studentId, status);
};

export const getMentorSessions = async (mentorId, status) => {
  return findSessionsByMentorId(mentorId, status);
};

export const acceptSession = async (sessionId, mentorId) => {
  const session = await findSessionById(sessionId);

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  if (session.mentorId !== mentorId) {
    throw new AppError("Unauthorized", 403);
  }

  if (session.status !== "pending") {
    throw new AppError("Only pending sessions can be accepted", 400);
  }

  const updatedSession = await updateSession(sessionId, {
    status: "accepted",

    acceptedAt: new Date(),
  });

  const payload = buildEventPayload("SESSION_ACCEPTED", updatedSession);

  await logSessionEvent(sessionId, "SESSION_ACCEPTED", payload);

  await publishSessionAccepted(payload);

  const meeting = await createMeetingForSession(updatedSession);

  const refreshedSession = await findSessionById(sessionId);

  return {
    session: refreshedSession,
    meeting,
  };
};

export const rejectSession = async (sessionId, mentorId, rejectionReason) => {
  const session = await findSessionById(sessionId);

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  if (session.mentorId !== mentorId) {
    throw new AppError("Unauthorized", 403);
  }

  if (session.status !== "pending") {
    throw new AppError("Only pending sessions can be rejected", 400);
  }

  const updatedSession = await updateSession(sessionId, {
    status: "rejected",

    rejectionReason,
  });

  const payload = buildEventPayload("SESSION_REJECTED", updatedSession);

  await logSessionEvent(sessionId, "SESSION_REJECTED", payload);

  await publishSessionRejected(payload);

  return updatedSession;
};

export const completeSession = async (sessionId, mentorId) => {
  const session = await findSessionById(sessionId);

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  if (session.mentorId !== mentorId) {
    throw new AppError("Unauthorized", 403);
  }

  if (session.status !== "accepted") {
    throw new AppError("Only accepted sessions can be completed", 400);
  }

  const updatedSession = await updateSession(sessionId, {
    status: "completed",

    completedAt: new Date(),
  });

  const payload = buildEventPayload("SESSION_COMPLETED", updatedSession);

  await logSessionEvent(sessionId, "SESSION_COMPLETED", payload);

  await publishSessionCompleted(payload);

  return updatedSession;
};

export const cancelSession = async (sessionId, userId) => {
  const session = await findSessionById(sessionId);

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  const isMentor = session.mentorId === userId;

  const isStudent = session.studentId === userId;

  if (!isMentor && !isStudent) {
    throw new AppError("Unauthorized", 403);
  }

  if (session.status === "completed" || session.status === "cancelled") {
    throw new AppError("Session cannot be cancelled", 400);
  }

  const updatedSession = await updateSession(sessionId, {
    status: "cancelled",

    cancelledAt: new Date(),
  });

  const payload = buildEventPayload("SESSION_CANCELLED", updatedSession);

  await logSessionEvent(sessionId, "SESSION_CANCELLED", payload);

  await publishSessionCancelled(payload);

  return updatedSession;
};
