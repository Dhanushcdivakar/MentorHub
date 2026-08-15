import ApiResponse from "../utils/ApiResponse.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

import {
  createNewSession,
  getSessionById,
  getStudentSessions,
  getMentorSessions,
  acceptSession,
  rejectSession,
  completeSession,
  cancelSession,
} from "../services/session.service.js";

import { getSessionTimeline } from "../services/event.service.js";

export const createSessionController = catchAsync(async (req, res) => {
  const studentId = req.headers["x-user-id"];

  const role = req.headers["x-user-role"];

  const session = await createNewSession(studentId, role, req.body);

  res
    .status(201)
    .json(new ApiResponse(201, session, "Session created successfully"));
});

export const getSessionController = catchAsync(async (req, res) => {
  const userId = req.headers["x-user-id"];
  const role = req.headers["x-user-role"];
  
  const session = await getSessionById(req.params.id);
  if (!session) {
    throw new AppError("Session not found", 404);
  }

  if (role !== "admin" && session.studentId !== userId && session.mentorId !== userId) {
    throw new AppError("Unauthorized. You do not own this session.", 403);
  }

  res
    .status(200)
    .json(new ApiResponse(200, session, "Session fetched successfully"));
});

export const getStudentSessionsController = catchAsync(async (req, res) => {
  const studentId = req.headers["x-user-id"];

  const status = req.query.status;

  const sessions = await getStudentSessions(studentId, status);

  res
    .status(200)
    .json(new ApiResponse(200, sessions, "Sessions fetched successfully"));
});

export const getMentorSessionsController = catchAsync(async (req, res) => {
  const mentorId = req.headers["x-user-id"];

  const status = req.query.status;

  const sessions = await getMentorSessions(mentorId, status);

  res
    .status(200)
    .json(new ApiResponse(200, sessions, "Sessions fetched successfully"));
});

export const getSessionTimelineController = catchAsync(async (req, res) => {
  const userId = req.headers["x-user-id"];
  const role = req.headers["x-user-role"];

  const session = await getSessionById(req.params.id);
  if (!session) {
    throw new AppError("Session not found", 404);
  }

  if (role !== "admin" && session.studentId !== userId && session.mentorId !== userId) {
    throw new AppError("Unauthorized. You do not own this session.", 403);
  }

  const timeline = await getSessionTimeline(req.params.id);

  res
    .status(200)
    .json(new ApiResponse(200, timeline, "Timeline fetched successfully"));
});

export const acceptSessionController = catchAsync(async (req, res) => {
  const mentorId = req.headers["x-user-id"];

  const session = await acceptSession(req.params.id, mentorId);

  res
    .status(200)
    .json(new ApiResponse(200, session, "Session accepted successfully"));
});

export const rejectSessionController = catchAsync(async (req, res) => {
  const mentorId = req.headers["x-user-id"];

  const session = await rejectSession(
    req.params.id,
    mentorId,
    req.body.rejectionReason,
  );

  res
    .status(200)
    .json(new ApiResponse(200, session, "Session rejected successfully"));
});

export const completeSessionController = catchAsync(async (req, res) => {
  const mentorId = req.headers["x-user-id"];

  const session = await completeSession(req.params.id, mentorId);

  res
    .status(200)
    .json(new ApiResponse(200, session, "Session completed successfully"));
});

export const cancelSessionController = catchAsync(async (req, res) => {
  const userId = req.headers["x-user-id"];

  const session = await cancelSession(req.params.id, userId);

  res
    .status(200)
    .json(new ApiResponse(200, session, "Session cancelled successfully"));
});
