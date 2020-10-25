const { ApolloServer, gql, PubSub } = require('apollo-server');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;

const movieSchema = new mongoose.Schema({
  title: String,
  releaseDate: Date,
  rating: Number,
  status: String,
  actorIds: [String],
});

const Movie = mongoose.model('Movie', movieSchema);

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

  input ActorInput {
    id: ID
  }

  input MovieInput {
    id: ID
    title: String
    releaseDate: Date
    rating: Int
    status: Status
    actors: [ActorInput]
  }

  type Mutation {
    addMovie(movie: MovieInput): [Movie]
  }

  type Subscription {
    movieAdded: Movie
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

const pubsub = new PubSub();
const MOVIE_ADDED = 'MOVIE_ADDED';

const resolvers = {
  Subscription: {
    movieAdded: {
      subscribe: () => {
        return pubsub.asyncIterator([MOVIE_ADDED])
      }
    }
  },

  Query: {
    movies: async () => {
      try {
        const allMovies = await Movie.find();
        return allMovies;
      } catch (e) {
        console.log("e", e);
        return []
      }
    },
    movie: async (obj, { id }, context, info) => {
      
      try {
        const foundMovie = await Movie.findById(id);
        return foundMovie;
      } catch (e) {
        console.log("e", e);
        return {}
      }
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
    addMovie: async (obj, { movie }, context) => {
      try {
        

        const movieAdded = await Movie.create({
          ...movie
        });

        pubsub.publish(MOVIE_ADDED, { movieAdded });
  
        return Movie.find();
      } catch (e) {
        console.log("e", e);
        return [];
      }
    }
  }
};

const server = new ApolloServer({ 
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
  context: ({ req }) => {
    const fakeUser = {
      userId: 'helloIAmUser'
    }

    return {
      ...fakeUser
    };
  }
});

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  console.log('✅ Database connected! ✅'); 

  server.listen({
    port: process.env.PORT || 4000
  }).then(({ url }) => {
    console.log(`Server started at ${url}`);
  });
});