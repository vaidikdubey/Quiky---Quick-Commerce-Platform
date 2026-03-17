export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message;

  if (process.env.NODE_ENV === "development") {
    console.error("--------------------------------------------------");
    console.error(`ERROR in ${req.method}, ${req.url}:`);
    console.error(err.stack); // This specifically identifies the file/line number
    console.error("--------------------------------------------------");
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    errors: err.errors || [],
  });
};
