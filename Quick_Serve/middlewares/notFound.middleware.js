const HttpStatus = require("../enums/httpStatusCode.enum");
const ResponseMessages = require("../enums/responseMessage.enum");

const handleNotFound = (req, res, next) => {
  res.error(HttpStatus.NOT_FOUND, "false", ResponseMessages.API_NOT_FOUND);
};

module.exports = handleNotFound;
