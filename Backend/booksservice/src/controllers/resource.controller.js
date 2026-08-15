import fs from "fs";
import path from "path";
import axios from "axios";
import * as resourceService from "../services/resource.service.js";
import * as cloudinaryService from "../services/cloudinary.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import Resource from "../models/resource.model.js";
import { escapeRegex } from "../utils/regex.util.js";

export const createResource = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    mentorId: req.user.id,
    uploadedBy: req.user.id,
  };

  const resource = await resourceService.createResource(payload, req.files);

  return res
    .status(201)
    .json(new ApiResponse(201, "Resource created successfully.", resource));
});

export const getResourceById = asyncHandler(async (req, res) => {
  const resource = await resourceService.getResourceById(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Resource fetched successfully.", resource));
});

export const getResources = asyncHandler(async (req, res) => {
  const { page, limit, search, category, sort } = req.query;

  // Fallback to non-paginated behavior if pagination params are omitted
  if (!page && !limit) {
    const resources = await resourceService.getResources(req.query);
    return res
      .status(200)
      .json(new ApiResponse(200, "Resources fetched successfully.", resources));
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  // Build filter
  const filter = {};
  if (search) {
    const sanitized = escapeRegex(search);
    filter.$or = [
      { title: { $regex: sanitized, $options: "i" } },
      { description: { $regex: sanitized, $options: "i" } },
    ];
  }
  if (category && category !== "all") {
    filter.category = category;
  }

  // Build sorting option
  let sortOption = { createdAt: -1 };
  if (sort) {
    if (sort.startsWith("-")) {
      sortOption = { [sort.substring(1)]: -1 };
    } else {
      sortOption = { [sort]: 1 };
    }
  }

  const resources = await resourceService.getResources(filter, {
    sort: sortOption,
    skip,
    limit: limitNum,
  });

  const total = await Resource.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(200, "Resources fetched successfully.", {
      resources,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    })
  );
});

export const updateResource = asyncHandler(async (req, res) => {
  const resource = await resourceService.updateResource(
    req.params.id,
    req.user.id,
    req.user.role,
    req.body,
    req.files,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Resource updated successfully.", resource));
});

export const deleteResource = asyncHandler(async (req, res) => {
  await resourceService.deleteResource(req.params.id, req.user.id, req.user.role);

  return res
    .status(200)
    .json(new ApiResponse(200, "Resource deleted successfully."));
});

export const downloadResource = asyncHandler(async (req, res) => {
  const data = await resourceService.downloadResource(req.params.id);

  const fileUrl = data.downloadUrl;
  const originalName = data.originalName || "resource.pdf";

  if (!fileUrl) {
    return res.status(404).json(new ApiResponse(404, "File not found."));
  }

  // Set response headers for direct secure binary download
  res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(originalName)}"`);
  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  // Check if it is a local upload path
  if (fileUrl.startsWith("http://localhost") || fileUrl.includes("uploads/")) {
    const filename = path.basename(fileUrl.split("?")[0]);
    const filePath = path.join(process.cwd(), "uploads", filename);
    if (fs.existsSync(filePath)) {
      return fs.createReadStream(filePath).pipe(res);
    }
  }

  // Fetch the file from Cloudinary and stream it back to the client
  try {
    const response = await axios({
      method: "get",
      url: fileUrl,
      responseType: "stream",
    });
    return response.data.pipe(res);
  } catch (err) {
    console.error("Error piping file from Cloudinary:", err);
    return res.status(500).json(new ApiResponse(500, "Failed to download file from storage."));
  }
});

export const uploadSingleFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json(new ApiResponse(400, "File is required."));
  }

  const folder = req.query.type === "profile" ? "mentorhub/profiles" : undefined;
  const result = await cloudinaryService.uploadFile(req.file, folder);

  return res
    .status(200)
    .json(
      new ApiResponse(200, "File uploaded successfully.", {
        url: result.url,
        publicId: result.publicId,
      }),
    );
});
