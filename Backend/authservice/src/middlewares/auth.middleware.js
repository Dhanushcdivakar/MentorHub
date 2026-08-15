import { verifyAccessToken } from "../utils/token.util.js";

import { findUserById } from "../repositories/auth.repository.js";

import { AppError } from "../utils/AppError.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("Unauthorized", 401));
    }

    const decoded = verifyAccessToken(token);

    const user = await findUserById(decoded.id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    req.user = user;

    next();
  } catch {
    next(new AppError("Invalid Token", 401));
  }
};

export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Forbidden", 403));
    }

    next();
  };
