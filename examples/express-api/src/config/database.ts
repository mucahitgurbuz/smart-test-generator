import mongoose from "mongoose";
import { logger } from "../utils/logger";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/smart-test-generator-demo";

export const connectDatabase = async (): Promise<void> => {
  try {
    const connection = await mongoose.connect(MONGODB_URI);
    logger.info(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info("MongoDB disconnected");
  } catch (error) {
    logger.error("MongoDB disconnection error:", error);
    throw error;
  }
};
