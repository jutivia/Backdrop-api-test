const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("./custom-api");

class UserNotFound extends CustomAPIError {
  constructor() {
    super('User Not Found');
    this.statusCode = StatusCodes.NOT_FOUND;
  }
}

module.exports = UserNotFound;
