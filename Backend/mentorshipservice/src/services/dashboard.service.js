import { Session } from "../models/session.model.js";
import { Review } from "../models/review.model.js";

export const getStudentDashboard = async (studentId) => {
  const [
    upcomingSessions,
    completedSessions,
    cancelledSessions,
    mentorsWorkedWith,
  ] = await Promise.all([
    Session.countDocuments({
      studentId,
      status: "accepted",
    }),

    Session.countDocuments({
      studentId,
      status: "completed",
    }),

    Session.countDocuments({
      studentId,
      status: "cancelled",
    }),

    Session.distinct("mentorId", {
      studentId,
      status: "completed",
    }),
  ]);

  return {
    upcomingSessions,
    completedSessions,
    cancelledSessions,
    mentorsWorkedWith: mentorsWorkedWith.length,
  };
};

export const getMentorDashboard = async (mentorId) => {
  const [pendingRequests, upcomingSessions, completedSessions, reviews] =
    await Promise.all([
      Session.countDocuments({
        mentorId,
        status: "pending",
      }),

      Session.countDocuments({
        mentorId,
        status: "accepted",
      }),

      Session.countDocuments({
        mentorId,
        status: "completed",
      }),

      Review.find({
        mentorId,
      }),
    ]);

  const totalReviews = reviews.length;

  const averageRating =
    totalReviews === 0
      ? 0
      : Number(
          (
            reviews.reduce((sum, review) => sum + review.rating, 0) /
            totalReviews
          ).toFixed(1),
        );

  return {
    pendingRequests,
    upcomingSessions,
    completedSessions,
    totalReviews,
    averageRating,
  };
};
