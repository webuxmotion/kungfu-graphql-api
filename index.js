const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`
  enum Status {
    WATCHED
    INTERESTED
    NOT_INTERESTED
    UNKNOWN
  }
  type Actor {
    id: ID!
    name: String!
  }
  type Movie {
    id: ID!
    title: String
    releaseDate: String
    rating: Int
    status: Status
    actor: [Actor]
  }
  type Query {
    movies: [Movie]
    movie(id: ID): Movie
  }
`;

const movies = [
  {
    id: "25",
    title: "5 Deadly Venoms",
    releaseDate: "10-10-1983",
    rating: 5,
    actor: [
      {
        id: "dfdf",
        name: "Gordon Liu"
      }
    ]
  },
  {
    id: "sdf",
    title: "36th Chamber",
    releaseDate: "10-10-1993",
    rating: 5
  }
];

const resolvers = {
  Query: {
    movies: () => {
      return movies;
    },
    movie: (obj, { id }, context, info) => {
      const foundMovie = movies.find(movie => movie.id === id);
      return foundMovie;
    }
  }
};

const server = new ApolloServer({ 
  typeDefs,
  resolvers,
  introspection: true,
  playground: true
});

server.listen({
  port: process.env.PORT || 4000
}).then(({ url }) => {
  console.log(`Server started at ${url}`);
});