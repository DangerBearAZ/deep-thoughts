const { User, Thought } = require('../models');
// graphQL has built in error handing this is calling 
const { AuthenticationError } = require('apollo-server-express');
// importing sign in function form utils 
const { signToken } = require('../utils/auth'); 

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password')
          .populate('thoughts')
          .populate('friends');
    
        return userData;
      }
    
      throw new AuthenticationError('Not logged in');
    },
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
    }, 
  },
  Mutation: {
    addUser: async (parent, args) => {
        // Mongoose User model creates a new user in the database with whatever is passed in as the args.
        const user = await User.create(args);
        //passing in sign in token to auth 
        const token = signToken(user);

        return {token, user };
    },
    login: async (parent, {email, password }) => {
      const user = await User.findOne({ email });
      
      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user); 
      return { token, user };

    },
    //Only logged-in users should be able to use this mutation, hence why we check for the existence of context.user first
    addThought: async (parents, args, context) => {
      if (context.user) {
        const thought = await Thought.create({...args, username: context.user.username});

        await User.findByIdAndUpdate(
          {_id: context.user._id }, 
          { $push: { thoughts: thought._id } },
          // without the { new: true } flag Mongo would return the original document instead of the updated document.
          { new: true }
        );
        return thought;
      }
      throw new AuthenticationError("You need to be logged in!");
    }
  }
};

module.exports = resolvers;