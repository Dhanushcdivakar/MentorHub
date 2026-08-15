import Joi from "joi";

const dayAvailabilityJoi = Joi.object({
  active: Joi.boolean().required(),
  from: Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  to: Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
});

const availabilityJoi = Joi.object({
  monday: dayAvailabilityJoi.optional(),
  tuesday: dayAvailabilityJoi.optional(),
  wednesday: dayAvailabilityJoi.optional(),
  thursday: dayAvailabilityJoi.optional(),
  friday: dayAvailabilityJoi.optional(),
  saturday: dayAvailabilityJoi.optional(),
  sunday: dayAvailabilityJoi.optional(),
});

export const updateProfileSchema = Joi.object({
  bio: Joi.string().max(500).allow("").optional(),

  skills: Joi.array().items(Joi.string()).optional(),

  experience: Joi.number().min(0).optional(),

  profilePicture: Joi.string().allow("").optional(),

  socialLinks: Joi.object({
    github: Joi.string().allow(""),

    linkedin: Joi.string().allow(""),

    portfolio: Joi.string().allow(""),
  }).optional(),

  availability: availabilityJoi.optional(),
});
