const productionConfig = {
  mongodb: {
    poolSize: 10,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: false,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    family: 4,
    keepAlive: true,
    keepAliveInitialDelay: 300000,
    retryWrites: true,
    w: 'majority'
  },
  sequelize: {
    pool: {
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 10000
    },
    dialectOptions: {
      connectTimeout: 60000,
      options: {
        requestTimeout: 30000
      }
    },
    logging: false
  }
};

const developmentConfig = {
  mongodb: {
    poolSize: 5,
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true
  },
  sequelize: {
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: console.log
  }
};

module.exports = process.env.NODE_ENV === 'production' ? productionConfig : developmentConfig;