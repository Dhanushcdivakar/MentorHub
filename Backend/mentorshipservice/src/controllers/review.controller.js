import ApiResponse from "../utils/ApiResponse.js";
import catchAsync from "../utils/catchAsync.js";

import { addReview, getMentorReviews } from "../services/review.service.js";

export const addReviewController = catchAsync(async (req, res) => {
  const studentId = req.headers["x-user-id"];

  const review = await addReview(req.params.sessionId, studentId, req.body);

  res
    .status(201)
    .json(new ApiResponse(201, review, "Review added successfully"));
});

export const getMentorReviewsController = catchAsync(async (req, res) => {
  const reviews = await getMentorReviews(req.params.mentorId);

  res
    .status(200)
    .json(new ApiResponse(200, reviews, "Reviews fetched successfully"));
});
