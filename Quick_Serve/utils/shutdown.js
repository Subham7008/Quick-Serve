const logger = require('./logger');

function handleGracefulShutdown(server) {
  const shutdownSignals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
  let isShuttingDown = false;

  shutdownSignals.forEach(signal => {
    process.on(signal, async () => {
      if (isShuttingDown) {
        return;
      }
      
      isShuttingDown = true;
      logger.info(`Received ${signal}. Starting graceful shutdown...`);

      // Stop accepting new connections
      server.close(async (err) => {
        if (err) {
          logger.error('Error during server shutdown:', err);
          process.exit(1);
        }

        try {
          // Close database connections
          if (global.mongoose) {
            await global.mongoose.connection.close();
            logger.info('MongoDB connection closed.');
          }

          if (global.sequelize) {
            await global.sequelize.close();
            logger.info('SQL connection closed.');
          }

          logger.info('Graceful shutdown completed.');
          process.exit(0);
        } catch (error) {
          logger.error('Error during cleanup:', error);
          process.exit(1);
        }
      });

      // Force shutdown after timeout
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000); // 30 seconds timeout
    });
  });
}

module.exports = handleGracefulShutdown;