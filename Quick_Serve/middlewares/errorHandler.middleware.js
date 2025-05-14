const HttpStatus = require("../enums/httpStatusCode.enum");
const ResponseMessages = require("../enums/responseMessage.enum");
const mongoose = require('mongoose');

const errorHandler = (err, req, res, next) => {
  console.log("Error Middleware: " + err);

  // Handle Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    return res.error(
      HttpStatus.UNPROCESSABLE_ENTITY,
      "false",
      ResponseMessages.VALIDATION_ERROR,
      Object.values(err.errors).map(e => ({
        message: e.message,
        path: e.path,
        value: e.value
      }))
    );
  }

  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.error(
      HttpStatus.CONFLICT,
      "false",
      `${field} already exists`,
      { field, value: err.keyValue[field] }
    );
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    return res.error(
      HttpStatus.BAD_REQUEST,
      "false",
      "Invalid ID format",
      { path: err.path, value: err.value }
    );
  }

  // Handle other MongoDB/Mongoose errors
  if (err.name && (err.name.includes('Mongo') || err.name.includes('Mongoose'))) {
    return res.error(
      HttpStatus.INTERNAL_SERVER_ERROR,
      "false",
      ResponseMessages.DATABASE_ERROR,
      err.message
    );
  }

  // Default to 500 server error for other uncaught errors
  return res.error(
    HttpStatus.INTERNAL_SERVER_ERROR,
    "false",
    ResponseMessages.INTERNAL_SERVER_ERROR,
    err.message
  );
};

module.exports = errorHandler;
