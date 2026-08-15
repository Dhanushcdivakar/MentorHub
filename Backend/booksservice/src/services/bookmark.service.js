import * as bookmarkRepository from "../repositories/bookmark.repository.js";
import * as resourceRepository from "../repositories/resource.repository.js";

import ApiError from "../utils/ApiError.js";
import { invalidateResourceCache } from "../utils/cacheInvalidation.js";

export const addBookmark = async (userId, resourceId) => {
  const resource = await resourceRepository.findById(resourceId);

  if (!resource) {
    throw new ApiError(404, "Resource not found.");
  }

  const existing = await bookmarkRepository.findByUserAndResource(
    userId,
    resourceId,
  );

  if (existing) {
    throw new ApiError(409, "Resource already bookmarked.");
  }

  const bookmark = await bookmarkRepository.create({
    userId,
    resourceId,
  });

  const totalBookmarks = await bookmarkRepository.countByResource(resourceId);

  await resourceRepository.updateBookmarkCount(resourceId, totalBookmarks);

  await invalidateResourceCache();

  return bookmark;
};

export const removeBookmark = async (userId, resourceId) => {
  const bookmark = await bookmarkRepository.findByUserAndResource(
    userId,
    resourceId,
  );

  if (!bookmark) {
    throw new ApiError(404, "Bookmark not found.");
  }

  await bookmarkRepository.remove(userId, resourceId);

  const totalBookmarks = await bookmarkRepository.countByResource(resourceId);

  await resourceRepository.updateBookmarkCount(resourceId, totalBookmarks);

  await invalidateResourceCache();

  return true;
};

export const getBookmarks = async (userId) => {
  return await bookmarkRepository.findByUser(userId);
};
