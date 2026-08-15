import ApiResponse from "../utils/ApiResponse.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import { getSessionById } from "../services/session.service.js";
import { getMeetingBySessionId } from "../services/meeting.service.js";

export const getMeetingController = catchAsync(async (req, res) => {
  const userId = req.headers["x-user-id"];
  const role = req.headers["x-user-role"];

  // Verify ownership of the associated session
  const session = await getSessionById(req.params.sessionId);
  if (!session) {
    throw new AppError("Session not found", 404);
  }

  if (role !== "admin" && session.studentId !== userId && session.mentorId !== userId) {
    throw new AppError("Unauthorized. You do not own this session.", 403);
  }

  const meeting = await getMeetingBySessionId(req.params.sessionId);

  res
    .status(200)
    .json(new ApiResponse(200, meeting, "Meeting fetched successfully"));
});
