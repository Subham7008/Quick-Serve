const deploymentConfig = {
  development: {
    cors: {
      origin: 'http://localhost:5173',
      credentials: true
    },
    logging: {
      level: 'debug',
      format: 'dev'
    },
    rateLimiting: {
      windowMs: 15 * 60 * 1000,
      max: 1000
    },
    security: {
      helmet: {
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: false,
        crossOriginResourcePolicy: false,
        dnsPrefetchControl: true,
        expectCt: true,
        frameguard: true,
        hidePoweredBy: true,
        hsts: false,
        ieNoOpen: true,
        noSniff: true,
        originAgentCluster: true,
        permittedCrossDomainPolicies: true,
        referrerPolicy: true,
        xssFilter: true
      }
    }
  },
  production: {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true
    },
    logging: {
      level: process.env.LOG_LEVEL || 'error',
      format: 'combined'
    },
    rateLimiting: {
      windowMs: 15 * 60 * 1000,
      max: 100
    },
    security: {
      helmet: {
        contentSecurityPolicy: true,
        crossOriginEmbedderPolicy: true,
        crossOriginOpenerPolicy: true,
        crossOriginResourcePolicy: true,
        dnsPrefetchControl: true,
        expectCt: true,
        frameguard: true,
        hidePoweredBy: true,
        hsts: true,
        ieNoOpen: true,
        noSniff: true,
        originAgentCluster: true,
        permittedCrossDomainPolicies: true,
        referrerPolicy: true,
        xssFilter: true
      }
    }
  }
};

module.exports = deploymentConfig[process.env.NODE_ENV || 'development'];