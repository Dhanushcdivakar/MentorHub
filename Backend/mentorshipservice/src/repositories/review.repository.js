import { Review } from "../models/review.model.js";

export const createReview = (reviewData) => {
  return Review.create(reviewData);
};

export const findReviewBySessionId = (sessionId) => {
  return Review.findOne({
    sessionId,
  });
};

export const findReviewsByMentorId = (mentorId) => {
  return Review.find({
    mentorId,
  }).sort({
    createdAt: -1,
  });
};
