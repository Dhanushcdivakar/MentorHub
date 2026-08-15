import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().trim().required(),

  email: Joi.string().email().required(),

  password: Joi.string()
    .min(6)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])/)
    .required()
    .messages({
      "string.min": "Password must be at least 6 characters long",
      "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, and one special character",
      "any.required": "Password is required",
    }),

  role: Joi.string().valid("student", "mentor", "admin").optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),

  password: Joi.string().required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const logoutSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email address",
    "any.required": "Email is required",
  }),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    "any.required": "Token is required",
  }),
  password: Joi.string()
    .min(6)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])/)
    .required()
    .messages({
      "string.min": "Password must be at least 6 characters long",
      "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, and one special character",
      "any.required": "Password is required",
    }),
});

export const googleLoginSchema = Joi.object({
  idToken: Joi.string().required().messages({
    "any.required": "Google ID Token is required",
  }),
});


