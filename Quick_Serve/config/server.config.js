const serverConfig = {
  development: {
    port: process.env.APP_PORT || 3333,
    host: '127.0.0.1',
    baseUrl: process.env.BASE_URL || 'https://quick-serve-production.up.railway.app',
    startupTimeout: 30000,
    gracefulShutdownTimeout: 30000,
    healthCheck: {
      enabled: true,
      interval: 30000,
      path: '/health'
    }
  },
  production: {
    port: process.env.APP_PORT || 3333,
    host: '0.0.0.0',
    baseUrl: process.env.BASE_URL,
    startupTimeout: 60000,
    gracefulShutdownTimeout: 60000,
    healthCheck: {
      enabled: true,
      interval: 60000,
      path: '/health'
    },
    cluster: {
      enabled: true,
      workers: 'auto' // 'auto' will use number of CPU cores
    }
  }
};

module.exports = serverConfig[process.env.NODE_ENV || 'development'];