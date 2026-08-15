import Resource from "../models/resource.model.js";

export const getTrending = async (limit = 10) => {
  return await Resource.find({
    status: "ACTIVE",
  })
    .sort({
      totalViews: -1,
      averageRating: -1,
    })
    .limit(limit)
    .populate("category");
};

export const getTopRated = async (limit = 10) => {
  return await Resource.find({
    status: "ACTIVE",
  })
    .sort({
      averageRating: -1,
      totalRatings: -1,
    })
    .limit(limit)
    .populate("category");
};

export const getMostViewed = async (limit = 10) => {
  return await Resource.find({
    status: "ACTIVE",
  })
    .sort({
      totalViews: -1,
    })
    .limit(limit)
    .populate("category");
};

export const getMostDownloaded = async (limit = 10) => {
  return await Resource.find({
    status: "ACTIVE",
  })
    .sort({
      totalDownloads: -1,
    })
    .limit(limit)
    .populate("category");
};
