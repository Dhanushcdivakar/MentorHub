import mongoose from "mongoose";
import Category from "../models/category.model.js";
import redis from "./redis.config.js";
import logger from "./logger.config.js";

export const connectDB = async (mongoUri, retries = 5, delay = 5000) => {
  let connected = false;
  for (let i = 1; i <= retries; i++) {
    try {
      await mongoose.connect(mongoUri);
      logger.info("MongoDB Connected successfully to booksservice");
      connected = true;
      break;
    } catch (error) {
      logger.error(`MongoDB Connection Attempt ${i} Failed: ${error.message}`);
      if (i === retries) {
        logger.error("Max database connection retries reached. Exiting booksservice...");
        process.exit(1);
      }
      logger.info(`Retrying in ${delay / 1000}s...`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }

  if (connected) {
    // Seed default categories if database is empty
    const count = await Category.countDocuments();
    if (count === 0) {
      logger.info("Seeding default categories...");
      const defaultCategories = [
        { name: "Development", description: "Software engineering, web, mobile, architecture" },
        { name: "Design", description: "UI/UX, graphic design, design systems" },
        { name: "Product Management", description: "Strategy, roadmap, execution" },
        { name: "Data Science", description: "Machine learning, statistics, analytics" },
        { name: "Career Growth", description: "Interviews, resume tips, soft skills" }
      ];
      await Category.insertMany(defaultCategories);
      logger.info("Default categories seeded successfully!");

      try {
        await redis.del("categories");
        logger.info("Evicted categories cache key.");
      } catch (cacheErr) {
        logger.error(`Failed to clear categories cache: ${cacheErr.message}`);
      }
    }
  }
};
