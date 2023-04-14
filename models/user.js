const mongoose = require("mongoose");
const countries = require("../utils/conuntries");
const countryNames = countries.map((x) => (x = x.name));
const jwt = require("jsonwebtoken");
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      reuired: [true, "kindly enter a name"],
      unique: true,
    },
    email: {
      type: String,
      reuired: [true, "kindly enter a valid email"],
      lowerCase: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Kindly provide a password"],
    },
    country: {
      type: String,
      enums: countryNames,
      required: [true, "kindly select your country"],
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

UserSchema.methods.createJWT = function () {
  console.log('createJWT called');
  return jwt.sign(
    {
      userId: this._id,
      name: this.name,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  );
};
module.exports = mongoose.model("User", UserSchema);
