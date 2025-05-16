const cors = require('cors');

const corsMiddleware = cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://quick-serve-production.up.railway.app', 'https://quick-serve-anubce8cv-subham-shankar-sahoos-projects.vercel.app', 'https://quick-serve-lt8ap4a3z-subham-shankar-sahoos-projects.vercel.app'] 
    : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://[::1]:5173', 'http://localhost:3333', 'http://127.0.0.1:3333', 'http://[::1]:3333'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // 24 hours
});

module.exports = corsMiddleware;