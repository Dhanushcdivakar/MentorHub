import * as analyticsRepository from "../repositories/analytics.repository.js";
import * as resourceRepository from "../repositories/resource.repository.js";
import * as cacheService from "./cache.service.js";
export const incrementView = async (resourceId) => {
  return await resourceRepository.incrementViews(resourceId);
};

export const incrementDownload = async (resourceId) => {
  return await resourceRepository.incrementDownloads(resourceId);
};

export const getTrending = async (limit = 10) => {
  const cacheKey = `analytics:trending:${limit}`;

  const cached = await cacheService.get(cacheKey);

  if (cached) {
    return cached;
  }

  const data = await analyticsRepository.getTrending(limit);

  await cacheService.set(cacheKey, data, 900);

  return data;
};

export const getTopRated = async (limit = 10) => {
  const cacheKey = `analytics:topRated:${limit}`;

  const cached = await cacheService.get(cacheKey);

  if (cached) {
    return cached;
  }

  const data = await analyticsRepository.getTopRated(limit);

  await cacheService.set(cacheKey, data, 900);

  return data;
};

export const getMostViewed = async (limit = 10) => {
  const cacheKey = `analytics:views:${limit}`;

  const cached = await cacheService.get(cacheKey);

  if (cached) {
    return cached;
  }

  const data = await analyticsRepository.getMostViewed(limit);

  await cacheService.set(cacheKey, data, 900);

  return data;
};

export const getMostDownloaded = async (limit = 10) => {
  const cacheKey = `analytics:downloads:${limit}`;

  const cached = await cacheService.get(cacheKey);

  if (cached) {
    return cached;
  }

  const data = await analyticsRepository.getMostDownloaded(limit);

  await cacheService.set(cacheKey, data, 900);

  return data;
};
