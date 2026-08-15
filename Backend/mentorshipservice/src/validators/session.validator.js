import Joi from "joi";

export const createSessionSchema = Joi.object({
  mentorId: Joi.string().required(),

  scheduledAt: Joi.date().required(),

  durationInMinutes: Joi.number().min(15).required(),

  agenda: Joi.string().max(1000).optional(),

  mentorName: Joi.string().max(100).optional(),

  studentName: Joi.string().max(100).optional(),
});

export const rejectSessionSchema = Joi.object({
  rejectionReason: Joi.string().max(500).required(),
});

export const completeSessionSchema = Joi.object({});
