import User from "../models/user.model.js";

export const createUser = async (userData) => {
  return await User.create(userData);
};

export const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

export const findUserByEmailWithPassword = async (email) => {
  return await User.findOne({ email }).select("+password");
};

export const findUserById = async (id) => {
  return await User.findById(id);
};

export const updateUserPassword = async (email, hashedPassword) => {
  return await User.findOneAndUpdate({ email }, { password: hashedPassword }, { new: true });
};

