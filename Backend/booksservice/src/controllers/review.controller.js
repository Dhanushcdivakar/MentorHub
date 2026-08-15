import * as reviewService from "../services/review.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const addReview = asyncHandler(async (req, res) => {
  const review = await reviewService.addReview({
    ...req.body,
    userId: req.user.id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Review added successfully.", review));
});

export const updateReview = asyncHandler(async (req, res) => {
  const review = await reviewService.updateReview(req.params.id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, "Review updated successfully.", review));
});

export const deleteReview = asyncHandler(async (req, res) => {
  await reviewService.deleteReview(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Review deleted successfully."));
});

export const getReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewService.getReviews(req.params.resourceId);

  return res
    .status(200)
    .json(new ApiResponse(200, "Reviews fetched successfully.", reviews));
});
