const cacheConfig = {
  development: {
    // In-memory caching for development
    memory: {
      max: 100, // Maximum number of items
      ttl: 60 * 5 // 5 minutes
    },
    // Disable Redis in development
    redis: null
  },
  production: {
    // In-memory caching with larger capacity
    memory: {
      max: 1000,
      ttl: 60 * 15 // 15 minutes
    },
    // Redis configuration for distributed caching
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      password: process.env.REDIS_PASSWORD,
      db: 0,
      // Connection options
      connectTimeout: 10000,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      // Cache options
      maxmemoryPolicy: 'allkeys-lru',
      keyPrefix: 'quickserve:',
      defaultTTL: 3600 // 1 hour
    },
    // Cache strategies
    strategies: {
      user: {
        ttl: 3600 * 24, // 24 hours
        invalidateOn: ['update', 'delete']
      },
      shop: {
        ttl: 3600 * 12, // 12 hours
        invalidateOn: ['update']
      },
      product: {
        ttl: 3600 * 6, // 6 hours
        invalidateOn: ['update', 'delete']
      }
    }
  }
};

module.exports = cacheConfig[process.env.NODE_ENV || 'development'];