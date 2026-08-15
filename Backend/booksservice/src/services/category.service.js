import * as categoryRepository from "../repositories/category.repository.js";
import * as cacheService from "./cache.service.js";
import ApiError from "../utils/ApiError.js";
import { invalidateCategoryCache } from "../utils/cacheInvalidation.js";

export const createCategory = async (categoryData) => {
  const existing = await categoryRepository.findByName(categoryData.name);

  if (existing) {
    throw new ApiError(409, "Category already exists.");
  }

  const category = await categoryRepository.create(categoryData);

  await invalidateCategoryCache();

  return category;
};

export const getCategoryById = async (categoryId) => {
  const cacheKey = `category:${categoryId}`;

  const cachedCategory = await cacheService.get(cacheKey);

  if (cachedCategory) {
    return cachedCategory;
  }

  const category = await categoryRepository.findById(categoryId);

  if (!category) {
    throw new ApiError(404, "Category not found.");
  }

  await cacheService.set(cacheKey, category, 3600);

  return category;
};

export const getCategories = async () => {
  const cacheKey = "categories";

  const cachedCategories = await cacheService.get(cacheKey);

  if (cachedCategories && cachedCategories.length > 0) {
    return cachedCategories;
  }

  const categories = await categoryRepository.findAll();

  await cacheService.set(cacheKey, categories, 3600);

  return categories;
};

export const updateCategory = async (categoryId, updateData) => {
  const category = await categoryRepository.findById(categoryId);

  if (!category) {
    throw new ApiError(404, "Category not found.");
  }

  const updatedCategory = await categoryRepository.update(
    categoryId,
    updateData,
  );

  await invalidateCategoryCache();

  return updatedCategory;
};

export const deleteCategory = async (categoryId) => {
  const category = await categoryRepository.findById(categoryId);

  if (!category) {
    throw new ApiError(404, "Category not found.");
  }

  await categoryRepository.remove(categoryId);

  await invalidateCategoryCache();

  return true;
};
