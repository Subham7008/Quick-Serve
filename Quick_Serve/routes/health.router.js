const express = require('express');
const os = require('os');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

const healthRouter = express.Router();

healthRouter.get('/', async (req, res) => {
  try {
    const healthCheck = {
      uptime: process.uptime(),
      timestamp: Date.now(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        usage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2) + '%'
      },
      cpu: {
        cores: os.cpus().length,
        model: os.cpus()[0].model,
        speed: os.cpus()[0].speed
      },
      database: {
        status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
      }
    };

    res.status(200).json({
      status: 'success',
      message: 'Server is healthy',
      data: healthCheck
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      message: 'Server health check failed',
      error: error.message
    });
  }
});

module.exports = healthRouter;