const CustomAPIError = require('./custom-api')
const BadRequestError = require('./bad-request')
const { UserNotFound, NotVerified } = require('./not-verified')
const  UnauthenticatedError = require('./unauthenticated')
const AppError = require('./AppError')

module.exports = {
  CustomAPIError,
  BadRequestError,
  NotVerified,
  UserNotFound,
  AppError,
  UnauthenticatedError
};
