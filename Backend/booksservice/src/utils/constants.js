export const USER_ROLES = Object.freeze({
  ADMIN: "ADMIN",
  MENTOR: "MENTOR",
  MENTEE: "MENTEE",
});

export const RESOURCE_TYPES = Object.freeze({
  BOOK: "BOOK",
  PDF: "PDF",
  ARTICLE: "ARTICLE",
  VIDEO: "VIDEO",
  EXTERNAL_LINK: "EXTERNAL_LINK",
  DOCUMENTATION: "DOCUMENTATION",
});

export const RESOURCE_STATUS = Object.freeze({
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  ARCHIVED: "ARCHIVED",
});

export const DIFFICULTY_LEVELS = Object.freeze({
  BEGINNER: "BEGINNER",
  INTERMEDIATE: "INTERMEDIATE",
  ADVANCED: "ADVANCED",
});

export const SORT_OPTIONS = Object.freeze({
  LATEST: "latest",
  OLDEST: "oldest",
  MOST_VIEWED: "mostViewed",
  MOST_DOWNLOADED: "mostDownloaded",
  TOP_RATED: "topRated",
});

export const CACHE_KEYS = Object.freeze({
  RESOURCE: "resource",
  SEARCH: "search",
  CATEGORY: "category",
  TRENDING: "trending",
  TOP_RATED: "top-rated",
  MOST_VIEWED: "most-viewed",
});

export const CACHE_TTL = Object.freeze({
  RESOURCE: 60 * 30,
  SEARCH: 60 * 10,
  CATEGORY: 60 * 60 * 24,
  TRENDING: 60 * 15,
});

export const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE);

export const ALLOWED_FILE_TYPES = process.env.ALLOWED_FILE_TYPES.split(",");
