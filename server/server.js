const express = require('express');

// import ApolloServer 
const { ApolloServer } = require('apollo-server-express');
const path = require('path');
// import our typeDefs and resolvers 
const { typeDefs, resolvers } = require('./schemas');

// middleware from auth.js 
const { authMiddleware } = require('./utils/auth');

// the moongoose connection is in config file 
const db = require('./config/connection');

const PORT = process.env.PORT || 3001;
const app = express();
//create a new Apollo server and pass in our schema data inside of express server 
const server = new ApolloServer ({
  typeDefs,
  resolvers, 
  //adding contex of auth being passed from auth.js This ensures that every request performs an authentication check, and the updated request object will be passed to the resolvers as the context.
  context: authMiddleware
});

// integrate our Apollo server with the Express application as middleware 
server.applyMiddleware({ app });

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    //log where we can go to test our GQL API // to see built in apolo test npm run watch
    console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
  });
});
