const { login, verifyUserData, getAccountName } = require("./controller/user");
module.exports = {
  Query: {
    login: async (_, { email, password }) => {
      const token = await login(email, password);
      return {token };
    },
    getAccountName: async (_, { bank_code, account_number, account_name }, { userId }) => {
        const data = {
            bank_code,
            account_number,
            userId,
            account_name
        }
      const account__name = await getAccountName(
       data
      );
      return {account_name: account__name };
    },
  },
  Mutation: {
    verifyUser: async (
      _,
      { user_account_number, user_bank_code, user_account_name },
      { userId }
    ) => {
      const data = {
        user_account_number,
        user_bank_code,
        userId,
        user_account_name,
      };
      const userAccountDetails = await verifyUserData(data);
      return userAccountDetails;
    },
  },
};
