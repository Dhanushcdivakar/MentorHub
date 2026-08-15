import bcrypt from "bcryptjs";

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

export const hashToken = async (token) => {
  return await bcrypt.hash(token, 10);
};

export const compareToken = async (token, hashedToken) => {
  return await bcrypt.compare(token, hashedToken);
};
