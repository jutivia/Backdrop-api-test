class AppError extends Error {
    constructor(msg, statusCode) {
      super(msg, statusCode)
      this.statusCode = statusCode;
      this.msg = msg;
    }
  }
  
  module.exports = AppError
  