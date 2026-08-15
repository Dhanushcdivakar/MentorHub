import {
  getMyProfile,
  updateMyProfile,
  getProfileById,
  getAllMentors,
  searchProfiles,
} from "../services/user.service.js";

import ApiResponse from "../utils/ApiResponse.js";
import catchAsync from "../utils/catchAsync.js";
import { User } from "../models/user.model.js";

export const getCurrentUser = catchAsync(async (req, res) => {
  console.log("Headers:", req.headers);

  const authId = req.headers["x-user-id"];

  console.log("AuthId:", authId);

  const user = await getMyProfile(authId);

  res
    .status(200)
    .json(new ApiResponse(200, user, "Profile fetched successfully"));
});

export const updateCurrentUser = catchAsync(async (req, res) => {
  const authId = req.headers["x-user-id"];

  const updatedUser = await updateMyProfile(authId, req.body);

  res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});

export const getUserProfile = catchAsync(async (req, res) => {
  const user = await getProfileById(req.params.id);

  res
    .status(200)
    .json(new ApiResponse(200, user, "Profile fetched successfully"));
});

export const getMentors = catchAsync(async (req, res) => {
  const mentors = await getAllMentors();

  res
    .status(200)
    .json(new ApiResponse(200, mentors, "Mentors fetched successfully"));
});

export const searchUsersController = catchAsync(async (req, res) => {
  const { q = "" } = req.query;

  const users = await searchProfiles(q);

  res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

export const getUserStats = catchAsync(async (req, res) => {
  const totalStudents = await User.countDocuments({ role: "student" });
  const activeMentors = await User.countDocuments({ role: "mentor" });

  res
    .status(200)
    .json(new ApiResponse(200, { totalStudents, activeMentors }, "User stats fetched successfully"));
});
