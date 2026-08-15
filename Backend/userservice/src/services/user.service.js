import {
  findProfileByAuthId,
  findProfileById,
  updateProfile,
  findMentors,
  searchUsers,
} from "../repositories/user.repository.js";

import AppError from "../utils/AppError.js";

export const getMyProfile = async (authId) => {
  const user = await findProfileByAuthId(authId);

  if (!user) {
    throw new AppError("Profile not found", 404);
  }

  return user;
};

export const updateMyProfile = async (authId, updateData) => {
  const updatedUser = await updateProfile(authId, updateData);

  if (!updatedUser) {
    throw new AppError("Profile not found", 404);
  }

  return updatedUser;
};

export const getProfileById = async (id) => {
  const user = await findProfileById(id);

  if (!user) {
    throw new AppError("Profile not found", 404);
  }

  return user;
};

export const getAllMentors = async () => {
  return await findMentors();
};

export const searchProfiles = async (searchTerm) => {
  return await searchUsers(searchTerm);
};
