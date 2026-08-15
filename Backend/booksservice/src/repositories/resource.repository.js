import Resource from "../models/resource.model.js";

export const create = async (resourceData) => {
  return await Resource.create(resourceData);
};

export const findById = async (resourceId) => {
  return await Resource.findById(resourceId).populate("category");
};

export const update = async (resourceId, updateData) => {
  return await Resource.findByIdAndUpdate(resourceId, updateData, {
    new: true,
    runValidators: true,
  }).populate("category");
};

export const remove = async (resourceId) => {
  return await Resource.findByIdAndDelete(resourceId);
};

export const find = async (query = {}, options = {}) => {
  const {
    sort = { createdAt: -1 },
    skip = 0,
    limit = 10,
    select = "",
  } = options;

  return await Resource.find(query)
    .populate("category")
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .select(select);
};

export const count = async (query = {}) => {
  return await Resource.countDocuments(query);
};

export const updateRating = async (resourceId, averageRating, totalRatings) => {
  return await Resource.findByIdAndUpdate(
    resourceId,
    {
      averageRating,
      totalRatings,
    },
    {
      new: true,
    },
  );
};

export const updateBookmarkCount = async (resourceId, totalBookmarks) => {
  return await Resource.findByIdAndUpdate(
    resourceId,
    {
      totalBookmarks,
    },
    {
      new: true,
    },
  );
};
export const incrementViews = async (resourceId) => {
  return await Resource.findByIdAndUpdate(
    resourceId,
    {
      $inc: {
        totalViews: 1,
      },
    },
    {
      new: true,
    },
  ).populate("category");
};

export const incrementDownloads = async (resourceId) => {
  return await Resource.findByIdAndUpdate(
    resourceId,
    {
      $inc: {
        totalDownloads: 1,
      },
    },
    {
      new: true,
    },
  );
};
