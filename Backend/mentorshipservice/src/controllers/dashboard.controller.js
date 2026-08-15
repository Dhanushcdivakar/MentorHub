import ApiResponse from "../utils/ApiResponse.js";
import catchAsync from "../utils/catchAsync.js";

import {
  getStudentDashboard,
  getMentorDashboard,
} from "../services/dashboard.service.js";

export const getStudentDashboardController = catchAsync(async (req, res) => {
  const studentId = req.headers["x-user-id"];

  const dashboard = await getStudentDashboard(studentId);

  res
    .status(200)
    .json(new ApiResponse(200, dashboard, "Dashboard fetched successfully"));
});

export const getMentorDashboardController = catchAsync(async (req, res) => {
  const mentorId = req.headers["x-user-id"];

  const dashboard = await getMentorDashboard(mentorId);

  res
    .status(200)
    .json(new ApiResponse(200, dashboard, "Dashboard fetched successfully"));
});
