import AppError from "../utils/AppError.js";

import {
  createReview,
  findReviewBySessionId,
  findReviewsByMentorId,
} from "../repositories/review.repository.js";

import { findSessionById } from "../repositories/session.repository.js";

import { logSessionEvent } from "./event.service.js";

import { publishReviewAdded } from "../publishers/publishReviewAdded.js";

export const addReview = async (sessionId, studentId, reviewData) => {
  const session = await findSessionById(sessionId);

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  if (session.studentId !== studentId) {
    throw new AppError("Unauthorized", 403);
  }

  if (session.status !== "completed") {
    throw new AppError("Only completed sessions can be reviewed", 400);
  }

  const existingReview = await findReviewBySessionId(sessionId);

  if (existingReview) {
    throw new AppError("Review already exists", 400);
  }

  const review = await createReview({
    sessionId,

    mentorId: session.mentorId,

    studentId,

    rating: reviewData.rating,

    comment: reviewData.comment || "",
  });

  const payload = {
    eventType: "REVIEW_ADDED",

    sessionId: session._id.toString(),

    mentorId: session.mentorId,

    studentId,

    reviewId: review._id.toString(),

    rating: review.rating,

    timestamp: new Date().toISOString(),
  };

  await logSessionEvent(session._id, "REVIEW_ADDED", payload);

  await publishReviewAdded(payload);

  return review;
};

export const getMentorReviews = async (mentorId) => {
  return await findReviewsByMentorId(mentorId);
};
