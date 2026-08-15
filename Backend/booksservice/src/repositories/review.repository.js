import mongoose from "mongoose";
import Review from "../models/review.model.js";


export const create = async (reviewData) => {
  return await Review.create(reviewData);
};

export const findById = async (reviewId) => {
  return await Review.findById(reviewId);
};

export const findByUserAndResource = async (userId, resourceId) => {
  return await Review.findOne({
    userId,
    resourceId,
  });
};

export const findByResource = async (resourceId) => {
  return await Review.find({
    resourceId,
  }).sort({
    createdAt: -1,
  });
};

export const update = async (reviewId, updateData) => {
  return await Review.findByIdAndUpdate(reviewId, updateData, {
    new: true,
    runValidators: true,
  });
};

export const remove = async (reviewId) => {
  return await Review.findByIdAndDelete(reviewId);
};

export const aggregateRating = async (resourceId) => {
  const objId = typeof resourceId === "string" ? new mongoose.Types.ObjectId(resourceId) : resourceId;
  const result = await Review.aggregate([
    {
      $match: {
        resourceId: objId,
      },
    },
    {
      $group: {
        _id: "$resourceId",
        averageRating: {
          $avg: "$rating",
        },
        totalRatings: {
          $sum: 1,
        },
      },
    },
  ]);

  return (
    result[0] || {
      averageRating: 0,
      totalRatings: 0,
    }
  );
};
