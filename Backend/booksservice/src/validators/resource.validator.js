import Joi from "joi";
import {
  RESOURCE_TYPES,
  DIFFICULTY_LEVELS,
  RESOURCE_STATUS,
} from "../utils/constants.js";

export const createResourceSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),

  description: Joi.string().trim().min(10).required(),

  category: Joi.string().hex().length(24).required(),

  type: Joi.string()
    .valid(...Object.values(RESOURCE_TYPES))
    .required(),

  difficulty: Joi.string()
    .valid(...Object.values(DIFFICULTY_LEVELS))
    .default(DIFFICULTY_LEVELS.BEGINNER),

  language: Joi.string().trim().default("English"),

  author: Joi.string().trim().allow("", null),

  tags: Joi.array().items(Joi.string().trim()).default([]),

  externalUrl: Joi.string().uri().allow("", null),

  estimatedReadTime: Joi.number().integer().min(0).default(0),

  status: Joi.string()
    .valid(...Object.values(RESOURCE_STATUS))
    .default(RESOURCE_STATUS.ACTIVE),
});

export const updateResourceSchema = createResourceSchema.fork(
  ["title", "description", "category", "type"],
  (schema) => schema.optional(),
);
