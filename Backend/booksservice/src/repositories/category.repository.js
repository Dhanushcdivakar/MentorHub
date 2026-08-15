import Category from "../models/category.model.js";

export const create = async (categoryData) => {
  return await Category.create(categoryData);
};

export const findById = async (categoryId) => {
  return await Category.findById(categoryId);
};

export const findByName = async (name) => {
  return await Category.findOne({
    name,
  });
};

export const findAll = async () => {
  return await Category.find({
    isActive: true,
  }).sort({
    name: 1,
  });
};

export const update = async (categoryId, updateData) => {
  return await Category.findByIdAndUpdate(categoryId, updateData, {
    new: true,
    runValidators: true,
  });
};

export const remove = async (categoryId) => {
  return await Category.findByIdAndDelete(categoryId);
};
