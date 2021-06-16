const express = require('express');

// import ApolloServer 
const { ApolloServer } = require('apollo-server-express');
// import our typeDefs and resolvers 
const { typeDefs, resolvers } = require('./schemas');

// the moongoose connection is in config file 
const db = require('./config/connection');

const PORT = process.env.PORT || 3001;
const app = express();
//create a new Apollo server and pass in our schema data inside of express server 
const server = new ApolloServer ({
  typeDefs,
  resolvers
});

// integrate our Apollo server with the Express application as middleware 
server.applyMiddleware({ app })

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    //log where we can go to test our GQL API // to see built in apolo test npm run watch
    console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
  });
});
const { User, Thought } = require('../models');

const resolvers = {
  Query: {
    users: async () => {
      return User.find()
        .select('-__v -password')
        .populate('thoughts')
        .populate('friends');
    },
    user: async (parent, { username }) => {
      return User.findOne({ username })
        .select('-__v -password')
        .populate('friends')
        .populate('thoughts');
    },
    thoughts: async (parent, { username }) => {
      const params = username ? { username } : {};
      return Thought.find(params).sort({ createdAt: -1 });
    },
    thought: async (parent, { _id }) => {
      return Thought.findOne({ _id });
    }
  }
};

module.exports = resolvers;