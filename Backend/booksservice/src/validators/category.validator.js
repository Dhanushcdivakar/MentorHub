import Joi from "joi";

export const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),

  description: Joi.string().trim().allow("", null),
});

export const updateCategorySchema = createCategorySchema.fork(
  ["name"],
  (schema) => schema.optional(),
);
