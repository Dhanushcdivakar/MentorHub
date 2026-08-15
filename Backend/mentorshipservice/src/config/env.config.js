import dotenv from "dotenv";
import Joi from "joi";
import { getSecret } from "../utils/secrets.util.js";

dotenv.config();

const mongoUri = getSecret("MONGO_URI");
const huggingfaceApiKey = getSecret("HUGGINGFACE_API_KEY");

const envSchema = Joi.object({
  PORT: Joi.number().default(5004),
  MONGO_URI: Joi.string().required(),
  RABBITMQ_URL: Joi.string().required(),
  HUGGINGFACE_API_KEY: Joi.string().optional(),
  NODE_ENV: Joi.string().default("development"),
}).unknown();

const envPayload = {
  ...process.env,
  MONGO_URI: mongoUri,
  HUGGINGFACE_API_KEY: huggingfaceApiKey,
};

const { error, value } = envSchema.validate(envPayload);

if (error) {
  console.error("Environment validation failed in mentorshipservice:", error.message);
  process.exit(1);
}

export const config = {
  port: value.PORT,
  mongoUri: value.MONGO_URI,
  rabbitmqUrl: value.RABBITMQ_URL,
  huggingfaceApiKey: value.HUGGINGFACE_API_KEY,
  nodeEnv: value.NODE_ENV,
};

