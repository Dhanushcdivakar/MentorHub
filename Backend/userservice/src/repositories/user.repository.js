import { User } from "../models/user.model.js";
import { escapeRegex } from "../utils/regex.util.js";

export const createProfile = (profileData) => {
  return User.create(profileData);
};

export const findProfileByAuthId = (authId) => {
  return User.findOne({
    authId,
  });
};

export const findProfileById = (id) => {
  return User.findById(id);
};

export const updateProfile = (authId, updateData) => {
  return User.findOneAndUpdate({ authId }, updateData, {
    new: true,
    runValidators: true,
  });
};

export const findMentors = () => {
  return User.find({
    role: "mentor",
  });
};

export const searchUsers = (searchTerm) => {
  const sanitizedSearch = escapeRegex(searchTerm);
  return User.find({
    $or: [
      {
        name: {
          $regex: sanitizedSearch,
          $options: "i",
        },
      },

      {
        skills: {
          $regex: sanitizedSearch,
          $options: "i",
        },
      },
    ],
  });
};

