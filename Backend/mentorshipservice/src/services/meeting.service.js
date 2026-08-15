import {
  createMeeting,
  findMeetingBySessionId,
} from "../repositories/meeting.repository.js";
import AppError from "../utils/AppError.js";
import { updateSession } from "../repositories/session.repository.js";

import { logSessionEvent } from "./event.service.js";

import { publishMeetingCreated } from "../publishers/publishMeetingCreated.js";

export const createMeetingForSession = async (session) => {
  const meetingLink = `https://meet.jit.si/mentorhub-${session._id}`;

  const meeting = await createMeeting({
    sessionId: session._id,

    meetingLink,

    provider: "jitsi",

    status: "scheduled",
  });

  await updateSession(session._id, {
    meetingId: meeting._id,
    meetingLink,
  });

  const payload = {
    eventType: "MEETING_CREATED",

    sessionId: session._id.toString(),

    mentorId: session.mentorId,

    studentId: session.studentId,

    meetingId: meeting._id.toString(),

    meetingLink,

    timestamp: new Date().toISOString(),
  };

  await logSessionEvent(session._id, "MEETING_CREATED", payload);

  await publishMeetingCreated(payload);

  return meeting;
};
export const getMeetingBySessionId = async (sessionId) => {
  const meeting = await findMeetingBySessionId(sessionId);

  if (!meeting) {
    throw new AppError("Meeting not found", 404);
  }

  return meeting;
};
