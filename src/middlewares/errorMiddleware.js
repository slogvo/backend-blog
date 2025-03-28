// File: src/middleware/errorMiddleware.js
/**
 * Handle 404 errors
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global error handler
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    status: 400,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  notFound,
  errorHandler,
};
