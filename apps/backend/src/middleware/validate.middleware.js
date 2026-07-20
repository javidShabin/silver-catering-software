import AppError from "../utils/AppError.js";

/**
 * Higher-order middleware function to validate requests using Zod schemas
 * @param {import("zod").AnyZodObject} schema - The Zod schema to validate against
 */
const validate = (schema) => (req, res, next) => {
  try {
    // We validate the entire request object (body, query, params)
    const validatedData = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params});
    
    // Crucial step: Reassign the stripped, validated data back to req to prevent mass assignment
    req.body = validatedData.body !== undefined ? validatedData.body : req.body;
    
    // In Express 5, req.query and req.params have getters only, so direct assignment fails.
    Object.defineProperty(req, 'query', { value: validatedData.query !== undefined ? validatedData.query : req.query, configurable: true, enumerable: true });
    Object.defineProperty(req, 'params', { value: validatedData.params !== undefined ? validatedData.params : req.params, configurable: true, enumerable: true });
    
    // If validation passes, proceed to the next middleware/controller
    next();
  } catch (error) {
    // If validation fails, Zod throws a ZodError
    // We safely extract the human-readable messages and format them
    const errorsList = error.errors || error.issues || [];
    const errorMessage = errorsList.length > 0
      ? errorsList
          .map((err) => `${err.path[err.path.length - 1] || "field"}: ${err.message}`)
          .join(", ")
      : error.message || "Unknown validation error";
      
    // Pass a 400 Bad Request error to our centralized globalErrorHandler
    next(new AppError(`Validation Error: ${errorMessage}`, 400));
  }
};

export default validate;
