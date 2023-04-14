const axios = require('axios');
require("dotenv").config();


exports.paystackResolver = async (account_number, bank_code) => {
    const config = {
      headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.paystack_secret_key}`,
      }
    };
    const url = `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`;
    return await axios.get(url, config)
  }

