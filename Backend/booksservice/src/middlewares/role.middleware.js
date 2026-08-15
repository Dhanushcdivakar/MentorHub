import ApiError from "../utils/ApiError.js";

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Unauthorized"));
    }

    const userRoleUpper = (req.user.role || "").toUpperCase();
    const allowedRolesUpper = roles.map((r) => r.toUpperCase());

    if (!allowedRolesUpper.includes(userRoleUpper)) {
      return next(
        new ApiError(403, "You are not authorized to perform this action."),
      );
    }

    next();
  };
};

export default authorize;
