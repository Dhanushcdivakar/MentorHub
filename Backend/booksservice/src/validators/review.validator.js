import Joi from "joi";

export const createReviewSchema = Joi.object({
  resourceId: Joi.string().hex().length(24).required(),

  rating: Joi.number().min(1).max(5).required(),

  review: Joi.string().trim().allow("").max(2000),
});

export const updateReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5),

  review: Joi.string().trim().allow("").max(2000),
}).min(1);
