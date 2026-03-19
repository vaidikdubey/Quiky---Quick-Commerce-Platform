import { ApiError } from "./api-error.js";

export function asyncHandler(fn) {
  return async function (req, res, next) {
    try {
      const result = await fn(req, res, next);

      return result;
    } catch (error) {
      if (error instanceof ApiError) return next(error);

      const statusCode = error.statusCode || 500;
      const message = error.message || "Internal server error";

      const apiError = new ApiError(statusCode, message, [error], error.stack);

      next(apiError);
    }
  };
}
