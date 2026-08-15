import { Meeting } from "../models/meeting.model.js";

export const createMeeting = (meetingData) => {
  return Meeting.create(meetingData);
};

export const findMeetingById = (meetingId) => {
  return Meeting.findById(meetingId);
};

export const findMeetingBySessionId = (sessionId) => {
  return Meeting.findOne({
    sessionId,
  });
};

export const updateMeeting = (meetingId, updateData) => {
  return Meeting.findByIdAndUpdate(meetingId, updateData, {
    new: true,
    runValidators: true,
  });
};
