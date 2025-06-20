import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  // Log the incoming request
  logger.info(`${method} ${originalUrl} - ${ip}`);

  // Override res.on('finish') to log response details
  res.on("finish", () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    // Log the response
    logger.info(`${method} ${originalUrl} - ${statusCode} - ${duration}ms`);
  });

  next();
};
