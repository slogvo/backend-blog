// src/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { rateLimit } = require('express-rate-limit');
const notionRoutes = require('./routes/notionRoute');
const sendEmailRoutes = require('./routes/send-email');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');

const configureMiddleware = (app) => {
  app.use(express.json());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
        },
      },
    }),
  );
  app.use(morgan('dev'));

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      status: 429,
      message: 'Too many requests, please try again later',
    },
  });
  app.use(limiter);
};

const configureRoutes = (app) => {
  app.use('/api', notionRoutes);
  app.use('/api', sendEmailRoutes);
  app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
};

const configureErrorHandling = (app) => {
  app.use(notFound);
  app.use(errorHandler);
};

const initServer = async (app) => {
  configureMiddleware(app);
  configureRoutes(app);
  configureErrorHandling(app);
};

module.exports = { initServer };
