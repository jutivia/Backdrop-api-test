require("dotenv").config();

// importSchema
const { createTestClient } = require("apollo-server-testing");
const { ApolloServer } = require("apollo-server");
const { importSchema } = require("graphql-import");
const jwt = require("jsonwebtoken");
const axios = require("axios");


// Mocks
jest.mock("axios");
const paystackAPiSuccessResult = {
  data: {
    status: true,
    message: "Account number resolved",
    data: {
      account_number: "0149957556",
      account_name: "OKI VICTORY OMOGHENE",
      bank_id: 9,
    },
  },
};
const paystackAPiErrorResult = new Error("Something went wrong");
paystackAPiErrorResult.response = {
  status: 404,
  data: {
    status: false,
    message: "Could not resolve account name. Check parameters or try again.",
  },
};


// Variables
const mockJwtSecret = "testjwtsecret";


// Models
const User = require("../models/user");


// Schema and resolvers
const typeDefs = importSchema(
  "/Users/user/Desktop/backdrop-api-test/schema.graphql"
);
const resolvers = require("../resolver");


// Helpers
const mockToken = () =>
  jwt.sign({ userId: mockUser.id, name: mockUser.name }, mockJwtSecret);


// Server setup
let mockUser;
beforeEach(() => {
  mockUser = {
    id: "5c8a1d5b0190b214360dc057",
    name: "Jonas Schmedtmann",
    email: "admin@natours.io",
    password: "$2a$12$Q0grHjH9PXc6SxivC8m12.2mZJ9BbKcgFpwSG4Y1ZEII8HJVzWeyS",
    country: "Nigeria",
    is_verified: false,
    createJWT: jest.fn().mockReturnValue(mockToken),
  };
});

const server = new ApolloServer({
  context: async () => {
    return { userId: mockUser.id };
  },
  typeDefs,
  resolvers,
});

const { query, mutate } = createTestClient(server);


// Tests
describe("Authentication tests", () => {
  test("should generate auth token  with correct email and password", async () => {
    const findOneSpy = jest
      .spyOn(User, "findOne")
      .mockImplementation(() => Promise.resolve(mockUser));
    const result = await query({
      query: `
        query {
          login(email: "admin@natours.io", password: "test1234") {
            token
          }
        }
      `,
    });
    expect(result.data).toBeDefined();
    expect(result.data.login.token).toBeDefined();
    findOneSpy.mockRestore();
  });

  test("should not generate auth token with incorrect email and password returns error", async () => {
    const findOneSpy = jest
      .spyOn(User, "findOne")
      .mockImplementation(() => Promise.resolve(mockUser));
    const result = await query({
      query: `
        query {
          login(email: "admin@natours.io", password: "password") {
            token
          }
        }
      `,
    });
    expect(result.errors).toBeDefined();
    expect(result.errors[0].message).toBe("Email-Password mismatch");
    findOneSpy.mockRestore();
  });
});

describe("getAccountName Query", () => {
  test("Should return account name provided from the paystackAPiSuccessResult", async () => {
    const findOneSpy = jest
      .spyOn(User, "findOne")
      .mockImplementation(() => Promise.resolve(mockUser));
    axios.get.mockResolvedValue(paystackAPiSuccessResult);
    const result = await query({
      query: `
        query {
          getAccountName( bank_code: "057",
          account_number: "0149957556" ){
            account_name
          }
        }
      `,
    });
    expect(findOneSpy).toHaveBeenCalled();
    expect(result.data).toBeDefined();
    expect(result.data.getAccountName).toBeDefined();
    expect(result.data.getAccountName.account_name).toEqual(
      "Oki Victory Omoghene"
    );
    findOneSpy.mockRestore();
  });

  test("should return account_name provided from query because it's levenshtein's distance is 2 or less", async () => {
    const findOneSpy = jest
      .spyOn(User, "findOne")
      .mockImplementation(() => Promise.resolve(mockUser));
    axios.get.mockResolvedValue(paystackAPiSuccessResult);
    const result = await query({
      query: `
        query {
          getAccountName( bank_code: "057",
          account_number: "0149957556",account_name: "OKI VICTORY OMOGHEPA" ){
            account_name
          }
        }
      `,
    });
    expect(findOneSpy).toHaveBeenCalled();
    expect(result.data).toBeDefined();
    expect(result.data.getAccountName).toBeDefined();
    expect(result.data.getAccountName.account_name).toEqual(
      "Oki Victory Omoghepa"
    );
    findOneSpy.mockRestore();
  });

  test("should return account name provided from the paystackAPiSuccessResult, when account_name is provided in the query, because it's levenshtein's distance is greater than 2", async () => {
    const findOneSpy = jest
      .spyOn(User, "findOne")
      .mockImplementation(() => Promise.resolve(mockUser));
    axios.get.mockResolvedValue(paystackAPiSuccessResult);
    const result = await query({
      query: `
        query {
          getAccountName( bank_code: "057",
          account_number: "0149957556",account_name: "OKI VICTORY OMOGHLQT" ){
            account_name
          }
        }
      `,
    });
    expect(findOneSpy).toHaveBeenCalled();
    expect(result.data).toBeDefined();
    expect(result.data.getAccountName).toBeDefined();
    expect(result.data.getAccountName.account_name).toEqual(
      "Oki Victory Omoghene"
    );
    findOneSpy.mockRestore();
  });
});

describe("Verify User Query", () => {
  test("Should call the findOneAndUpdate user once paystack resloves the account details successfully", async () => {
    const findOneSpy = jest
      .spyOn(User, "findOne")
      .mockImplementation(() => Promise.resolve(mockUser));

    const findOneAndUpdateSpy = jest
      .spyOn(User, "findOneAndUpdate")
      .mockImplementation(() =>
        Promise.resolve((mockUser.is_verified = true), mockUser)
      );
    axios.get.mockResolvedValue(paystackAPiSuccessResult);
    const result = await mutate({
      mutation: `
        mutation {
          verifyUser( user_bank_code: "057",
          user_account_number: "0149957556", user_account_name: "Oki Victory Omoghele" ){
            user_account_name
            user_bank_code
            user_account_number
          }
        }
      `,
    });
    expect(findOneSpy).toHaveBeenCalled();
    expect(findOneAndUpdateSpy).toHaveBeenCalled();
    expect(result.data).toBeDefined();
    expect(result.data.verifyUser).toBeDefined();
    expect(mockUser.is_verified).toEqual(true);
    expect(result.data.verifyUser.user_account_name).toEqual(
      "Oki Victory Omoghele"
    );
    findOneSpy.mockRestore();
    findOneAndUpdateSpy.mockRestore();
  });

  test("Should not call the findOneAndUpdate user once paystack does not reslove the account details", async () => {
    const findOneSpy = jest
      .spyOn(User, "findOne")
      .mockImplementation(() => Promise.resolve(mockUser));

    const findOneAndUpdateSpy = jest
      .spyOn(User, "findOneAndUpdate")
      .mockImplementation(() => Promise.resolve(mockUser));
    axios.get.mockRejectedValue(paystackAPiErrorResult);
    const result = await mutate({
      mutation: `
        mutation {
          verifyUser( user_bank_code: "057",
          user_account_number: "0149957556", user_account_name: "Oki Victory Omoghele" ){
            user_account_name
            user_bank_code
            user_account_number
          }
        }
      `,
    });
    console.log("res", result.error, mockUser);
    expect(findOneSpy).toHaveBeenCalled();
    expect(mockUser.is_verified).toEqual(false);
    expect(result.errors[0].message).toEqual(
      "Could not resolve account name. Check parameters or try again."
    );
    expect(findOneAndUpdateSpy).not.toHaveBeenCalled();
    findOneSpy.mockRestore();
    findOneAndUpdateSpy.mockRestore();
  });

  test("Should throw an error if ld is greater than 2", async () => {
    const findOneSpy = jest
      .spyOn(User, "findOne")
      .mockImplementation(() => Promise.resolve(mockUser));

    const findOneAndUpdateSpy = jest
      .spyOn(User, "findOneAndUpdate")
      .mockImplementation(() => Promise.resolve(mockUser));
    axios.get.mockResolvedValue(paystackAPiSuccessResult);
    const result = await mutate({
      mutation: `
        mutation {
          verifyUser( user_bank_code: "057",
          user_account_number: "0149957556", user_account_name: "Oki Victory Omoghepla" ){
            user_account_name
            user_bank_code
            user_account_number
          }
        }
      `,
    });
    expect(findOneSpy).toHaveBeenCalled();
    expect(mockUser.is_verified).toEqual(false);
    expect(result.errors[0].message).toEqual(
      "Account name provided and user account name derived has a levenshtein distance greater than 2"
    );
    expect(findOneAndUpdateSpy).not.toHaveBeenCalled();
    findOneSpy.mockRestore();
    findOneAndUpdateSpy.mockRestore();
  });
});
