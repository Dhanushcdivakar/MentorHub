import dotenv from "dotenv";
import Joi from "joi";
import { getSecret } from "../utils/secrets.util.js";

dotenv.config();

const mongoUri = getSecret("MONGO_URI");

const envSchema = Joi.object({
  PORT: Joi.number().default(5003),
  MONGO_URI: Joi.string().required(),
  RABBITMQ_URL: Joi.string().required(),
  NODE_ENV: Joi.string().default("development"),
}).unknown();

const envPayload = {
  ...process.env,
  MONGO_URI: mongoUri,
};

const { error, value } = envSchema.validate(envPayload);

if (error) {
  console.error("Environment validation failed in userservice:", error.message);
  process.exit(1);
}

export const config = {
  port: value.PORT,
  mongoUri: value.MONGO_URI,
  nodeEnv: value.NODE_ENV,
};

