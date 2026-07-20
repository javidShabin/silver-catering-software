class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    // status will be 'fail' for 4xx errors, and 'error' for 5xx errors
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    
    // We mark it as operational to distinguish between expected errors 
    // (like "User not found") vs programming bugs (like missing variables)
    this.isOperational = true;

    // Captures the stack trace so we know exactly where the error happened
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
