import AppError from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

const handlePrismaUniqueConstraint = (err) => {
  const target = err.meta?.target ? err.meta.target.join(", ") : "field";
  const message = `Duplicate value for ${target}. Please use another value!`;
  return new AppError(message, 400);
};

const handlePrismaRecordNotFound = () => {
  return new AppError("Record not found.", 404);
};

const handlePrismaForeignKeyConstraint = (err) => {
  const message = `Invalid reference in ${err.meta?.field_name || "database operation"}.`;
  return new AppError(message, 400);
};

const handlePrismaValidationError = (err) => {
  console.error("PRISMA VALIDATION ERROR:", err.message);
  const message = `Invalid data provided to database.`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401);

export const globalErrorHandler = (err, req, res, next) => {
  let error = err;
  error.statusCode = err.statusCode || 500;
  error.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    // In development, we want detailed error stacks
    const errRes = {
      success: false,
      status: error.status,
      message: error.message,
      error: error,
      stack: err.stack};
    import("fs").then(fs => fs.writeFileSync("last_error.log", JSON.stringify(errRes, null, 2)));
    res.status(error.statusCode).json(errRes);
  } else {
    // In production, format known database/JWT errors
    
    // Prisma Error Codes
    if (err.code === "P2002") error = handlePrismaUniqueConstraint(error);
    if (err.code === "P2025") error = handlePrismaRecordNotFound(error);
    if (err.code === "P2003") error = handlePrismaForeignKeyConstraint(error);
    if (err.name === "PrismaClientValidationError") error = handlePrismaValidationError(error);
    
    // JWT Errors
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

    // If it's a trusted operational error (like AppError)
    if (error.isOperational) {
      res.status(error.statusCode).json({
        success: false,
        status: error.status,
        message: error.message});
    } else {
      // 1) Asynchronous structured log for developer
      logger.error({ err }, "Unhandled error");

      // 2) Send generic message to client
      res.status(500).json({
        success: false,
        status: "error",
        message: "Something went very wrong!"});
    }
  }
};

