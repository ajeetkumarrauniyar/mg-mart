import { Request, Response, NextFunction } from "express";
import { ValidationError } from "./validation.js";

export class ApiError extends Error {
  public statusCode: number;
  public field?: string | undefined;

  constructor(message: string, statusCode: number = 500, field?: string) {
    super(message);
    this.statusCode = statusCode;
    this.field = field;
    this.name = "ApiError";

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

export const createError = (
  message: string,
  statusCode: number = 500,
  field?: string
): ApiError => {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  if (field !== undefined) {
    error.field = field;
  }
  return error;
};

export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal Server Error";
  let field = error.field;

  // Handle specific error types
  if (error instanceof ValidationError) {
    statusCode = 400;
    message = error.message;
    field = error.field;
  }

  // Handle Firebase errors
  if (error.message.includes("auth/")) {
    statusCode = 401;
    message = "Authentication failed";
  }

  if (error.message.includes("permission-denied")) {
    statusCode = 403;
    message = "Permission denied";
  }

  if (error.message.includes("not-found")) {
    statusCode = 404;
    message = "Resource not found";
  }

  // Log error for debugging
  console.error(`Error ${statusCode}: ${message}`, {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    field,
  });

  res.status(statusCode).json({
    success: false,
    error: message,
    field,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const notFound = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = createError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};
