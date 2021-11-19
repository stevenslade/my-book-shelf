// bring in the apollo express server
const { AuthenticationError } = require('apollo-server-express');

const { User } = require('../models');

// import sign token function from auth
const { signToken } = require('../utils/auth');


const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id }).select('-__v -password'); //the select operator with -_v and -password means to remove the version key and the password from the query
        return userData;
      }
      throw new AuthenticationError('Log in is required.');
    },
  },

  Mutation: {
    //this login function destructures the graphQL args into email and password, it creates a signToken and returns it and the user
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('Password or Email is incorrect');
      }
      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Password or Email is incorrect');
      }
      const token = signToken(user);
      return { token, user };
    },
    // adding a user also creates a signToken and returns it
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (parent, { bookData }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: bookData } },
          { new: true }
        );
        return updatedUser;
      }
      throw new AuthenticationError('Log in is required.');
    },
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
        return updatedUser;
      }
      throw new AuthenticationError('Log in is required');
    },  
  },
};

module.exports = resolvers;