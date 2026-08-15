import * as resourceRepository from "../repositories/resource.repository.js";
import * as cacheService from "./cache.service.js";
import { escapeRegex } from "../utils/regex.util.js";


export const searchResources = async (filters = {}) => {
  const {
    q = "",
    category,
    difficulty,
    language,
    type,
    page = 1,
    limit = 10,
    sort = "latest",
  } = filters;

  const cacheKey = `search:${JSON.stringify(filters)}`;

  const cachedData = await cacheService.get(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  const query = {
    status: "ACTIVE",
  };

  if (q) {
    query.$text = {
      $search: q,
    };
  }

  if (category) {
    query.category = category;
  }

  if (difficulty) {
    query.difficulty = difficulty;
  }

  if (language) {
    query.language = language;
  }

  if (type) {
    query.type = type;
  }

  let sortOption = {
    createdAt: -1,
  };

  switch (sort) {
    case "oldest":
      sortOption = {
        createdAt: 1,
      };
      break;

    case "rating":
      sortOption = {
        averageRating: -1,
      };
      break;

    case "views":
      sortOption = {
        totalViews: -1,
      };
      break;

    case "downloads":
      sortOption = {
        totalDownloads: -1,
      };
      break;

    default:
      sortOption = {
        createdAt: -1,
      };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const resources = await resourceRepository.find(query, {
    sort: sortOption,
    skip,
    limit: Number(limit),
  });

  const total = await resourceRepository.count(query);

  const response = {
    resources,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };

  await cacheService.set(cacheKey, response, 600);

  return response;
};

export const getSearchSuggestions = async (keyword) => {
  if (!keyword) {
    return [];
  }

  const sanitized = escapeRegex(keyword);

  const resources = await resourceRepository.find(
    {
      title: {
        $regex: sanitized,
        $options: "i",
      },
    },
    {
      select: "title",
      limit: 5,
    },
  );

  return resources.map((resource) => resource.title);
};
