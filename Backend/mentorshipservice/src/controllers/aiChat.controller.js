import ApiResponse from "../utils/ApiResponse.js";
import catchAsync from "../utils/catchAsync.js";
import {
  getAIChatSessions,
  createAIChatSession,
  getAIChatSessionDetail,
  sendAIChatMessage,
  deleteAIChatSession,
} from "../services/aiChat.service.js";

export const getSessionsController = catchAsync(async (req, res) => {
  const userId = req.headers["x-user-id"];
  const sessions = await getAIChatSessions(userId);
  res
    .status(200)
    .json(new ApiResponse(200, sessions, "AI chat sessions fetched successfully"));
});

export const createSessionController = catchAsync(async (req, res) => {
  const userId = req.headers["x-user-id"];
  const { title } = req.body;
  const session = await createAIChatSession(userId, title);
  res
    .status(201)
    .json(new ApiResponse(201, session, "AI chat session created successfully"));
});

export const getSessionDetailController = catchAsync(async (req, res) => {
  const userId = req.headers["x-user-id"];
  const { sessionId } = req.params;
  const session = await getAIChatSessionDetail(userId, sessionId);
  res
    .status(200)
    .json(new ApiResponse(200, session, "AI chat session details fetched successfully"));
});

export const sendMessageController = catchAsync(async (req, res) => {
  const userId = req.headers["x-user-id"];
  const { sessionId } = req.params;
  const { message } = req.body;
  
  const updatedSession = await sendAIChatMessage(userId, sessionId, message);
  res
    .status(200)
    .json(new ApiResponse(200, updatedSession, "Message processed and response received successfully"));
});

export const deleteSessionController = catchAsync(async (req, res) => {
  const userId = req.headers["x-user-id"];
  const { sessionId } = req.params;
  const result = await deleteAIChatSession(userId, sessionId);
  res
    .status(200)
    .json(new ApiResponse(200, result, "AI chat session deleted successfully"));
});
