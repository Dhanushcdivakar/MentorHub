import Bookmark from "../models/bookmark.model.js";

export const create = async (bookmarkData) => {
  return await Bookmark.create(bookmarkData);
};

export const findByUserAndResource = async (userId, resourceId) => {
  return await Bookmark.findOne({
    userId,
    resourceId,
  });
};

export const findByUser = async (userId) => {
  return await Bookmark.find({
    userId,
  }).populate({
    path: "resourceId",
    populate: {
      path: "category",
    },
  });
};

export const remove = async (userId, resourceId) => {
  return await Bookmark.findOneAndDelete({
    userId,
    resourceId,
  });
};

export const countByResource = async (resourceId) => {
  return await Bookmark.countDocuments({
    resourceId,
  });
};
