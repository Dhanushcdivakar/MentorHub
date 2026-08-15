import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const healthCheck = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(200, "Resource Service is healthy.", {
      service: "resource-service",
      status: "UP",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }),
  );
});
