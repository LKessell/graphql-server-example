const { ApolloServer, gql } = require('apollo-server');
const LRU = require("lru-cache");

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.

  type Book {
    title: String
    author: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).

  type Query {
    books: [Book]
  }

  type Mutation {
    addBook(title: String, author: String): Book
  }
`;

const cache = new LRU({ max: 50, maxAge: 1000 * 60 * 60 });

// const books = [
//     {
//       title: 'The Awakening',
//       author: 'Kate Chopin',
//     },
//     {
//       title: 'City of Glass',
//       author: 'Paul Auster',
//     },
//     {
//         title: 'Howl\'s Moving Castle',
//         author: 'Diana Wynne Jones',
//     },
// ];

// Resolvers define the technique for fetching the types defined in the schema
const resolvers = {
    Query: {
        books: () => {
          const books = [{
                  title: 'The Awakening',
                  author: 'Kate Chopin',
                },];
          cache.forEach((author, title) => books.push({ author, title }));
          return books;
        }
    },
    Mutation: {
        addBook: (_, { title, author }) => {
            const book = { title, author };
            cache.set(title, author);
            return book;
        }
    }
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});