import mongoose from "mongoose";

export const connectDB = async (mongoUri, retries = 5, delay = 5000) => {
  for (let i = 1; i <= retries; i++) {
    try {
      await mongoose.connect(mongoUri);
      console.log("MongoDB Connected successfully to authservice");
      return;
    } catch (error) {
      console.error(`MongoDB Connection Attempt ${i} Failed: ${error.message}`);
      if (i === retries) {
        console.error("Max database connection retries reached. Exiting authservice...");
        process.exit(1);
      }
      console.log(`Retrying in ${delay / 1000}s...`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
};

