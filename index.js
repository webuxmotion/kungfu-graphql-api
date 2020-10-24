const { ApolloServer, gql } = require('apollo-server');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

const typeDefs = gql`

  scalar Date

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
    releaseDate: Date
    rating: Int
    status: Status
    actors: [Actor]
  }

  type Query {
    movies: [Movie]
    movie(id: ID): Movie
  }

  type Mutation {
    addMovie(
      id: ID,
      title: String,
      releaseDate: Date
    ): [Movie]
  }
`;

const movies = [
  {
    id: "25",
    title: "5 Deadly Venoms",
    releaseDate: new Date("10-12-1983"),
    rating: 5,
    actors: [
      {
        id: "gordon"
      },
    ]
  },
  {
    id: "sdf",
    title: "36th Chamber",
    releaseDate: new Date("10-10-1993"),
    rating: 5
  }
];

const actors = [
  {
    id: "gordon",
    name: "Gordon Liu actor"
  },
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
  },

  Movie: {
    actors: (obj, arg, context) => {
      const actorIds = obj.actors.map(actor => actor.id);
      const filteredActors = actors.filter(actor => actorIds.includes(actor.id));

      return filteredActors;
    }
  },

  Date: new GraphQLScalarType({
    name: "Date",
    description: "It's a date",
    parseValue(value) {
      return new Date(value)
    },
    serialize(value) {
      return value.getTime()
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return new Date(ast.value);
      }
      return null;
    }
  }),

  Mutation: {
    addMovie: (obj, { id, title, releaseDate }, context) => {
      const newMoviesList = [
        ...movies,
        {
          id, title, releaseDate
        }
      ];

      return newMoviesList;
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