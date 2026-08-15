import dotenv from "dotenv";
import Joi from "joi";
import { getSecret } from "../utils/secrets.util.js";

dotenv.config();

const mongoUri = getSecret("MONGODB_URI");
const jwtSecret = getSecret("JWT_SECRET");
const cloudinaryApiKey = getSecret("CLOUDINARY_API_KEY");
const cloudinaryApiSecret = getSecret("CLOUDINARY_API_SECRET");

const envSchema = Joi.object({
  PORT: Joi.number().default(5005),
  NODE_ENV: Joi.string().default("development"),
  MONGODB_URI: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  REDIS_URL: Joi.string().optional(),
  REDIS_HOST: Joi.string().default("127.0.0.1"),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().optional(),
  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),
  CLOUDINARY_FOLDER: Joi.string().default("mentorhub/resources"),
  MAX_FILE_SIZE: Joi.number().default(10485760),
  ALLOWED_FILE_TYPES: Joi.string().required(),
}).unknown();

const envPayload = {
  ...process.env,
  MONGODB_URI: mongoUri,
  JWT_SECRET: jwtSecret,
  CLOUDINARY_API_KEY: cloudinaryApiKey,
  CLOUDINARY_API_SECRET: cloudinaryApiSecret,
};

const { error, value } = envSchema.validate(envPayload);

if (error) {
  console.error("Environment validation failed in booksservice:", error.message);
  process.exit(1);
}

export const env = {
  port: value.PORT,
  nodeEnv: value.NODE_ENV,
  mongoUri: value.MONGODB_URI,
  jwtSecret: value.JWT_SECRET,
  redisUrl: value.REDIS_URL,
  redisHost: value.REDIS_HOST,
  redisPort: value.REDIS_PORT,
  redisPassword: value.REDIS_PASSWORD,
  cloudinary: {
    cloudName: value.CLOUDINARY_CLOUD_NAME,
    apiKey: value.CLOUDINARY_API_KEY,
    apiSecret: value.CLOUDINARY_API_SECRET,
    folder: value.CLOUDINARY_FOLDER,
  },
  upload: {
    maxFileSize: value.MAX_FILE_SIZE,
    allowedTypes: value.ALLOWED_FILE_TYPES.split(",").map((t) => t.trim()),
  },
};

