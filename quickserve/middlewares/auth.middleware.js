import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const authenticateToken = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(403).json({
        status: 'error',
        message: 'Authorization header missing'
      });
    }

    const authParts = req.headers.authorization.split(' ');
    if (authParts.length !== 2 || authParts[0].toLowerCase() !== 'bearer') {
      return res.status(403).json({
        status: 'error',
        message: 'Invalid authorization format'
      });
    }

    const token = authParts[1];
    
    jwt.verify(token, process.env.JWT_SECRET, (err, tokenData) => {
      if (!err && tokenData) {
        req.mwValue = {};
        req.mwValue.auth = tokenData;
        next();
      } else {
        return res.status(403).json({
          status: 'error',
          message: 'User Unauthorized',
          error: err?.message
        });
      }
    });
  } catch (error) {
    return res.status(403).json({
      status: 'error',
      message: 'Authentication failed',
      error: error.message
    });
  }
};