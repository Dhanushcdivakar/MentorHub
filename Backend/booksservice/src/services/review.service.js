import * as reviewRepository from "../repositories/review.repository.js";
import * as resourceRepository from "../repositories/resource.repository.js";
import ApiError from "../utils/ApiError.js";
import { invalidateReviewCache } from "../utils/cacheInvalidation.js";

export const addReview = async (reviewData) => {
  const existing = await reviewRepository.findByUserAndResource(
    reviewData.userId,
    reviewData.resourceId,
  );

  if (existing) {
    throw new ApiError(409, "Review already submitted.");
  }

  const review = await reviewRepository.create(reviewData);

  await updateRatings(reviewData.resourceId);
  await invalidateReviewCache();

  return review;
};

export const updateReview = async (reviewId, updateData) => {
  const review = await reviewRepository.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found.");
  }

  const updatedReview = await reviewRepository.update(reviewId, updateData);

  await updateRatings(review.resourceId);
  await invalidateReviewCache();

  return updatedReview;
};

export const deleteReview = async (reviewId) => {
  const review = await reviewRepository.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found.");
  }

  await reviewRepository.remove(reviewId);

  await updateRatings(review.resourceId);
  await invalidateReviewCache();

  return true;
};

export const getReviews = async (resourceId) => {
  return await reviewRepository.findByResource(resourceId);
};

export const updateRatings = async (resourceId) => {
  const stats = await reviewRepository.aggregateRating(resourceId);

  await resourceRepository.updateRating(
    resourceId,
    Number(stats.averageRating.toFixed(1)),
    stats.totalRatings,
  );
};
