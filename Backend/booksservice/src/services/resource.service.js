import * as resourceRepository from "../repositories/resource.repository.js";
import * as categoryRepository from "../repositories/category.repository.js";
import * as cloudinaryService from "./cloudinary.service.js";
import ApiError from "../utils/ApiError.js";
import { invalidateResourceCache } from "../utils/cacheInvalidation.js";
import * as cacheService from "./cache.service.js";

export const createResource = async (resourceData, files = {}) => {
  const category = await categoryRepository.findById(resourceData.category);

  if (!category) {
    throw new ApiError(404, "Category not found.");
  }

  if (files?.thumbnail?.length) {
    resourceData.thumbnail = await cloudinaryService.uploadFile(
      files.thumbnail[0],
      "mentorhub/resources/thumbnails",
    );
  }

  if (files?.resourceFile?.length) {
    resourceData.resourceFile = await cloudinaryService.uploadFile(
      files.resourceFile[0],
      "mentorhub/resources/documents",
    );
  }

  const resource = await resourceRepository.create(resourceData);

  await invalidateResourceCache();

  return resource;
};

export const getResourceById = async (resourceId) => {
  const cacheKey = `resource:${resourceId}`;

  let resource = await cacheService.get(cacheKey);

  if (!resource) {
    resource = await resourceRepository.findById(resourceId);

    if (!resource) {
      throw new ApiError(404, "Resource not found.");
    }
  }

  resource = await resourceRepository.incrementViews(resourceId);

  await cacheService.set(cacheKey, resource, 1800);

  return resource;
};
export const downloadResource = async (resourceId) => {
  const resource = await resourceRepository.incrementDownloads(resourceId);

  if (!resource) {
    throw new ApiError(404, "Resource not found.");
  }
  await invalidateResourceCache();
  return {
    resourceId: resource._id,
    title: resource.title,
    downloadUrl: resource.resourceFile.url,
    originalName: resource.resourceFile.originalName,
    totalDownloads: resource.totalDownloads,
  };
};

export const getResources = async (query = {}, options = {}) => {
  const cacheKey = `resources:${JSON.stringify({
    query,
    options,
  })}`;

  const cachedResources = await cacheService.get(cacheKey);

  if (cachedResources) {
    return cachedResources;
  }

  const resources = await resourceRepository.find(query, options);

  await cacheService.set(cacheKey, resources, 600);

  return resources;
};

export const updateResource = async (resourceId, userId, role, updateData, files = {}) => {
  const existing = await resourceRepository.findById(resourceId);

  if (!existing) {
    throw new ApiError(404, "Resource not found.");
  }

  // Enforce ownership: only ADMIN or the mentor who uploaded the resource can modify
  if (role !== "ADMIN" && existing.uploadedBy.toString() !== userId.toString()) {
    throw new ApiError(403, "You do not have permission to update this resource.");
  }

  if (
    updateData.category &&
    updateData.category.toString() !== existing.category._id.toString()
  ) {
    const category = await categoryRepository.findById(updateData.category);

    if (!category) {
      throw new ApiError(404, "Category not found.");
    }
  }

  if (files?.thumbnail?.length) {
    if (existing.thumbnail?.publicId) {
      await cloudinaryService.deleteFile(existing.thumbnail.publicId);
    }

    updateData.thumbnail = await cloudinaryService.uploadFile(
      files.thumbnail[0],
      "mentorhub/resources/thumbnails",
    );
  }

  if (files?.resourceFile?.length) {
    if (existing.resourceFile?.publicId) {
      await cloudinaryService.deleteFile(existing.resourceFile.publicId);
    }

    updateData.resourceFile = await cloudinaryService.uploadFile(
      files.resourceFile[0],
      "mentorhub/resources/documents",
    );
  }

  const resource = await resourceRepository.update(resourceId, updateData);

  await invalidateResourceCache();

  return resource;
};

export const deleteResource = async (resourceId, userId, role) => {
  const existing = await resourceRepository.findById(resourceId);

  if (!existing) {
    throw new ApiError(404, "Resource not found.");
  }

  // Enforce ownership: only ADMIN or the mentor who uploaded the resource can delete
  if (role !== "ADMIN" && existing.uploadedBy.toString() !== userId.toString()) {
    throw new ApiError(403, "You do not have permission to delete this resource.");
  }

  if (existing.thumbnail?.publicId) {
    await cloudinaryService.deleteFile(existing.thumbnail.publicId);
  }

  if (existing.resourceFile?.publicId) {
    await cloudinaryService.deleteFile(existing.resourceFile.publicId);
  }

  await resourceRepository.remove(resourceId);

  await invalidateResourceCache();

  return true;
};
