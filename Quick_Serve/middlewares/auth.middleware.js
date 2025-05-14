const helpers = require("../utils/helper");

let authMiddleware = {};

// Helper function for consistent error logging
const logAuthError = (error, message) => {
  console.error(`[Auth Middleware Error] ${message}:`, error);
};

authMiddleware.checkUserAuth = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      logAuthError(null, "No authorization header present");
      return res
        .status(403)
        .json(helpers.errorResponse("403", "false", "Authorization header missing"));
    }

    const authParts = req.headers.authorization.split(" ");
    if (authParts.length !== 2 || authParts[0].toLowerCase() !== "bearer") {
      logAuthError(null, "Invalid authorization format");
      return res
        .status(403)
        .json(helpers.errorResponse("403", "false", "Invalid authorization format"));
    }

    const token = authParts[1];
    console.log("[Auth Middleware] Processing token:", token);
    
    helpers.verifyToken(token, (err, tokenData) => {
        if (!err && tokenData) {
          console.log("[Auth Middleware] Token verified successfully:", tokenData);
          req.mwValue = {};
          req.mwValue.auth = tokenData;
          next();
        } else {
          logAuthError(err, "Token verification failed");
          return res
            .status(403)
            .json(helpers.errorResponse("403", "false", "User Unauthorized", err?.message));
        }
    });
  } catch (err) {
    logAuthError(err, "Unexpected error in auth middleware");
    return res
      .status(403)
      .json(
        helpers.errorResponse("403", "false", "Authentication failed", err.message)
      );
  }
};

module.exports =authMiddleware;
