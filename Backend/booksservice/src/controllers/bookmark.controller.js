import * as bookmarkService from "../services/bookmark.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const addBookmark = asyncHandler(async (req, res) => {
  const bookmark = await bookmarkService.addBookmark(
    req.user.id,
    req.body.resourceId,
  );

  return res
    .status(201)
    .json(new ApiResponse(201, "Bookmark added successfully.", bookmark));
});

export const getBookmarks = asyncHandler(async (req, res) => {
  const bookmarks = await bookmarkService.getBookmarks(req.user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Bookmarks fetched successfully.", bookmarks));
});

export const removeBookmark = asyncHandler(async (req, res) => {
  await bookmarkService.removeBookmark(req.user.id, req.params.resourceId);

  return res
    .status(200)
    .json(new ApiResponse(200, "Bookmark removed successfully."));
});
