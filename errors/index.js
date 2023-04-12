const CustomAPIError = require('./custom-api')
const BadRequestError = require('./bad-request')
const  UserNotFound = require('./user-not-found')
const  UnauthenticatedError = require('./unauthenticated')

module.exports = {
  CustomAPIError,
  BadRequestError,
  UserNotFound,
  UnauthenticatedError
};
