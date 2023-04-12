require("dotenv").config();
require("express-async-errors");
const { ApolloServer, gql } = require("apollo-server");
const connectDb = require("./db/connect");
const jwt = require("jsonwebtoken");

const { importSchema } = require("graphql-import");
const typeDefs = importSchema("./schema.graphql");
const resolvers = require("./resolver");

const context = async ({ req }) => {
  const auth = (req.headers && req.headers.authorization) || "";
  if (!auth || !auth.startsWith("Bearer ")) {
    return { userId: null };
  }
  const token = auth.split(" ")[1];
  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    return { userId };
  } catch (error) {
    return { userId: null };
  }
};

const server = new ApolloServer({ context, typeDefs, resolvers });

const start = async () => {
  try {
    await connectDb(process.env.MONGO_URI);
    server
      .listen()
      .then(({ url }) =>
        console.log("Server is running on", url)
      );
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};
start();
