import {
  createSessionEvent,
  findEventsBySessionId,
} from "../repositories/sessionEvent.repository.js";

export const logSessionEvent = async (sessionId, eventType, payload = {}) => {
  return await createSessionEvent({
    sessionId,
    eventType,
    payload,
  });
};
export const buildEventPayload = (eventType, session) => {
  return {
    eventType,

    sessionId: session._id.toString(),

    mentorId: session.mentorId,

    studentId: session.studentId,

    timestamp: new Date().toISOString(),
  };
};

export const getSessionTimeline = async (sessionId) => {
  return await findEventsBySessionId(sessionId);
};
