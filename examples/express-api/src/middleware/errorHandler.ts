import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let err = error;

  // If error is not an instance of AppError, convert it
  if (!(error instanceof AppError)) {
    const statusCode = (error as any).statusCode || 500;
    const message = error.message || "Internal Server Error";
    err = new AppError(message, statusCode);
  }

  const appError = err as AppError;

  // Log error
  logger.error(`${appError.message}`, {
    statusCode: appError.statusCode,
    stack: appError.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

  // Send error response
  res.status(appError.statusCode).json({
    success: false,
    error: {
      message: appError.message,
      statusCode: appError.statusCode,
      ...(process.env.NODE_ENV === "development" && { stack: appError.stack }),
    },
  });
};
