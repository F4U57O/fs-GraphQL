const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();
const { GraphQLError } = require("graphql");
const Author = require("./models/author");
const Book = require("./models/book");
const User = require("./models/user");
const jwt = require("jsonwebtoken");

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      let filter = {};
      if (args.author) {
        const author = await Author.findOne({ name: args.author });
        if (author) {
          filter.author = author._id;
        } else {
          return [];
        }
      }
      if (args.genre) {
        filter.genres = { $in: [args.genre] };
      }
      return Book.find(filter).populate("author");
    },
    allGenres: async () => {
      const books = await Book.find({});
      const genres = new Set();
      books.forEach((book) => {
        book.genres.forEach((genre) => genres.add(genre));
      });
      return genres;
    },
    allAuthors: async () => {
      return Author.find({});
    },
    me: (root, args, context) => {
      return context.currentUser;
    },
    favoriteGenre: (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError("not authenticated");
      }
      return context.currentUser.favoriteGenre;
    },
    booksByGenre: async (root, args) => {
      if (!args.genre) {
        throw new GraphQLError("Genre is required");
      }
      return await Book.find({ genres: args.genre }).populate("author");
    },
  },
  Author: {
    bookCount: async (author, args, context) => {
      return context.bookCountLoader.load(author._id);
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      let author = await Author.findOne({ name: args.author });
      if (!author) {
        author = new Author({ name: args.author });
        const currentUser = context.currentUser;

        if (!currentUser) {
          throw new GraphQLError("not authenticated", {
            extensions: {
              code: "BAD_USER_INPUT",
            },
          });
        }
        try {
          await author.save();
        } catch (error) {
          if (error.name === "ValidationError") {
            throw new GraphQLError(error.message, {
              extensions: {
                code: "BAD_USER_INPUT",
                InvalidArgs: args,
              },
            });
          }
        }
      }
      const book = new Book({ ...args, author: author._id });
      try {
        await book.save();
        const populatedBook = await book.populate("author");
        pubsub.publish("BOOK_ADDED", { bookAdded: populatedBook });
        return populatedBook;
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: {
            code: "BAD_USER_INPUT",
            InvalidArgs: args,
          },
        });
      }
    },
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
            InvalidArgs: args,
          },
        });
      }
      const author = await Author.findOne({ name: args.name });
      if (!author) {
        throw new GraphQLError("Author not found", {
          extensions: {
            code: "BAD_USER_INPUT",
            InvalidArgs: args.name,
          },
        });
      }
      author.born = args.setBornTo;
      await author.save();
      return author;
    },
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      });

      return user.save().catch((error) => {
        throw new GraphQLError("Creating the user failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.username,
            error,
          },
        });
      });
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "secret") {
        throw new GraphQLError("wrong credentials", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator("BOOK_ADDED"),
    },
  },
};

module.exports = resolvers;
