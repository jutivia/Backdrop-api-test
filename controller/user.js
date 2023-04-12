
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { BadRequestError, UnauthenticatedError, UserNotFound } = require("../errors");
const axios = require('axios');
const catchAsync = require("../utils/asynAwait");

const login = catchAsync(async (email, password) => {
  const user = await User.findOne({ email });
  const verify = await bcrypt.compare(password, user.password);
  if (!verify) throw new BadRequestError("Email-Password mismatch");
  const token = user.createJWT();
  return token
});

const verifyUserData = catchAsync(async ({user_account_number, user_bank_code,userId, user_account_name}) => {
  if (!userId) throw new UnauthenticatedError
  const user = await User.findOne({ _id: userId });
  if (!user) throw new UserNotFound
  if (user.is_verified) return new BadRequestError ("User already verified");

  const data = await verifyAccountDetails(
    user.country,
    user_account_number,
    user_bank_code
  );

  const distance = levenshteinDistance(
    user_account_name.toLowerCase(),
    data.data.account_name.toLowerCase()
  );

  if (distance > 2) {
    throw new BadRequestError("Account name provided and user account name derived has a levenshtein distance greater than 2");
  }
 await User.findOneAndUpdate(
    { _id: userId },
    {
      is_verified: true,
    },
    { new: true }
  );

  return {
    user_account_name: capitalize(user_account_name),
    user_account_number,
    user_bank_code
  } ;
});

const getAccountName = catchAsync(async ({bank_code, account_number, userId, account_name}) => {
  if (!userId) throw new UnauthenticatedError
  const user = await User.findOne({ _id: userId });
  if (!user) throw new UserNotFound
  const data = await verifyAccountDetails(
    user.country,
    account_number,
    bank_code
  );
  let distance = 3
   if (account_name) {
     distance = levenshteinDistance(
     account_name.toLowerCase(),
      data.data.account_name.toLowerCase()
    );
   }
   const user_account_name = (distance > 2? capitalize(data.data.account_name) : capitalize(account_name))
  return user_account_name
});

const verifyAccountDetails = async (
  country,
  account_number,
  bank_code
) => {
  const config = {
    headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.paystack_secret_key}`,
    }
  };
  if (country === "Nigeria" || country ==="Ghana") {
    const url = `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`;
    return axios.get(url, config)
    .then(response => {
     return response.data
    })
    .catch(error => {
      throw new BadRequestError( error.response.data.message );
    });
   
  } else {
    throw new BadRequestError("Country not yet supported");
  }
};

const levenshteinDistance = (s, t) => {
  if (!s.length) return t.length;
  if (!t.length) return s.length;
  const arr = [];
  for (let i = 0; i <= t.length; i++) {
    arr[i] = [i];
    for (let j = 1; j <= s.length; j++) {
      arr[i][j] =
        i === 0
          ? j
          : Math.min(
              arr[i - 1][j] + 1,
              arr[i][j - 1] + 1,
              arr[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : 1)
            );
    }
  }
  return arr[t.length][s.length];
};

const capitalize = (str) => {
  return str.toLowerCase()
  .split(' ')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');
}

module.exports = {
  verifyUserData,
  login,
  getAccountName
};
