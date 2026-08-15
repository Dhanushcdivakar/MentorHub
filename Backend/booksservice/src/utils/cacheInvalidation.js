import * as cacheService from "../services/cache.service.js";

export const invalidateResourceCache = async () => {
  await Promise.all([
    cacheService.flushPattern("resource"),
    cacheService.flushPattern("search"),
    cacheService.flushPattern("analytics"),
  ]);
};

export const invalidateCategoryCache = async () => {
  await Promise.all([
    cacheService.flushPattern("category"),
    cacheService.flushPattern("resource"),
    cacheService.flushPattern("search"),
  ]);
};

export const invalidateReviewCache = async () => {
  await Promise.all([
    cacheService.flushPattern("resource"),
    cacheService.flushPattern("analytics"),
    cacheService.flushPattern("search"),
  ]);
};
