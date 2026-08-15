import Joi from "joi";

export const bookmarkSchema = Joi.object({
  resourceId: Joi.string().hex().length(24).required(),
});
