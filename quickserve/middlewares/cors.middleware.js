const cors = require('cors');

// Configure CORS options
const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://quick-serve-803tm4hn2-subham-shankar-sahoos-projects.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Export configured CORS middleware
module.exports = cors(corsOptions);
