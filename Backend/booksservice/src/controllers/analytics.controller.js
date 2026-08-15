import * as analyticsService from "../services/analytics.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getTrending = asyncHandler(async (req, res) => {
  const resources = await analyticsService.getTrending();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Trending resources fetched successfully.",
        resources,
      ),
    );
});

export const getTopRated = asyncHandler(async (req, res) => {
  const resources = await analyticsService.getTopRated();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Top rated resources fetched successfully.",
        resources,
      ),
    );
});

export const getMostViewed = asyncHandler(async (req, res) => {
  const resources = await analyticsService.getMostViewed();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Most viewed resources fetched successfully.",
        resources,
      ),
    );
});

export const getMostDownloaded = asyncHandler(async (req, res) => {
  const resources = await analyticsService.getMostDownloaded();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Most downloaded resources fetched successfully.",
        resources,
      ),
    );
});
