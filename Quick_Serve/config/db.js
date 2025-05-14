const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  const maxRetries = process.env.NODE_ENV === 'production' ? 5 : 1;
  let retryCount = 0;

  const connect = async () => {
    try {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quickservedatabase';
      console.log('Attempting to connect to MongoDB...');
      
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 20000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 0,
        retryWrites: true
      });

    mongoose.connection.on('connected', () => {
      console.log('MongoDB connection established successfully.');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB connection disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

    console.log('MongoDB connection established successfully.');
    return conn;
  } catch (error) {
    if (error.name === 'MongooseServerSelectionError') {
      console.error('Failed to connect to MongoDB. Please ensure MongoDB is running and accessible.');
      console.error('Connection Details:', {
        uri: process.env.MONGODB_URI ? 'Using environment variable' : 'Using default localhost',
        error: error.message
      });
      console.log('\nTroubleshooting steps:');
      console.log('1. Ensure MongoDB is installed on your system');
      console.log('2. Start MongoDB service:');
      console.log('   - Windows: Run "mongod" in a new terminal');
      console.log('   - macOS/Linux: Run "sudo service mongod start"');
      console.log('3. Verify MongoDB is running on port 27017');
      console.log('4. Check if the MongoDB URI in your .env file is correct')
    } else {
      console.error('Unexpected error while connecting to MongoDB:', error);
    }
    throw error;
  }
};

while (retryCount < maxRetries) {
  try {
    const connection = await connect();
    return connection;
  } catch (error) {
    retryCount++;
    if (retryCount < maxRetries) {
      console.log(`Connection attempt ${retryCount} failed. Retrying in 5 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

throw new Error('Failed to connect to MongoDB after multiple attempts');

};

module.exports = connectDB;
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quickservedatabase';
