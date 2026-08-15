import dotenv from "dotenv";
import Joi from "joi";
import { getSecret } from "../utils/secrets.util.js";

dotenv.config();

// Resolve secret-manager or file-based secrets if available
const mongoUri = getSecret("MONGO_URI");
const jwtSecret = getSecret("JWT_SECRET");
const refreshSecret = getSecret("REFRESH_SECRET");
const redisUrl = getSecret("REDIS_URL");
const resendApiKey = getSecret("RESEND_API_KEY");
const smtpPass = getSecret("SMTP_PASS");
const googleClientSecret = getSecret("GOOGLE_CLIENT_SECRET");

const envSchema = Joi.object({
  PORT: Joi.number().default(5002),
  MONGO_URI: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default("15m"),
  REFRESH_SECRET: Joi.string().required(),
  REFRESH_EXPIRES_IN: Joi.string().default("7d"),
  RABBITMQ_URL: Joi.string().required(),
  REDIS_URL: Joi.string().required(),
  RESEND_API_KEY: Joi.string().optional(),
  RESEND_FROM_EMAIL: Joi.string().default("onboarding@resend.dev"),
  SMTP_HOST: Joi.string().default("smtp-relay.brevo.com"),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().optional(),
  SMTP_PASS: Joi.string().optional(),
  SMTP_FROM_EMAIL: Joi.string().default("test_resend@example.com"),
  FRONTEND_URL: Joi.string().default("http://localhost:5173"),
  GOOGLE_CLIENT_ID: Joi.string().optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().optional(),
}).unknown();

// Build validation payload including resolved secrets
const envPayload = {
  ...process.env,
  MONGO_URI: mongoUri,
  JWT_SECRET: jwtSecret,
  REFRESH_SECRET: refreshSecret,
  REDIS_URL: redisUrl,
  RESEND_API_KEY: resendApiKey,
  SMTP_PASS: smtpPass,
  GOOGLE_CLIENT_SECRET: googleClientSecret,
};

const { error, value } = envSchema.validate(envPayload);

if (error) {
  console.error("Environment validation failed in authservice:", error.message);
  process.exit(1);
}

export const env = {
  port: value.PORT,
  mongoUri: value.MONGO_URI,
  jwtSecret: value.JWT_SECRET,
  jwtExpiresIn: value.JWT_EXPIRES_IN,
  refreshSecret: value.REFRESH_SECRET,
  refreshExpiresIn: value.REFRESH_EXPIRES_IN,
  redisUrl: value.REDIS_URL,
  resendApiKey: value.RESEND_API_KEY,
  resendFromEmail: value.RESEND_FROM_EMAIL,
  smtpHost: value.SMTP_HOST,
  smtpPort: value.SMTP_PORT,
  smtpUser: value.SMTP_USER,
  smtpPass: value.SMTP_PASS,
  smtpFromEmail: value.SMTP_FROM_EMAIL,
  frontendUrl: value.FRONTEND_URL,
  googleClientId: value.GOOGLE_CLIENT_ID,
  googleClientSecret: value.GOOGLE_CLIENT_SECRET,
};

