import { SessionEvent } from "../models/sessionEvent.model.js";

export const createSessionEvent = (eventData) => {
  return SessionEvent.create(eventData);
};

export const findEventsBySessionId = (sessionId) => {
  return SessionEvent.find({
    sessionId,
  }).sort({
    timestamp: 1,
  });
};

export const findEventsByEventType = (eventType) => {
  return SessionEvent.find({
    eventType,
  }).sort({
    timestamp: -1,
  });
};
