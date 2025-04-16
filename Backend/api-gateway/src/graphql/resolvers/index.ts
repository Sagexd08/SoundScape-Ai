import { IResolvers } from '@graphql-tools/utils';
import { GraphQLUpload } from 'graphql-upload';
import { GraphQLScalarType, Kind } from 'graphql';
import { PubSub } from 'graphql-subscriptions';
import { AuthenticationError, UserInputError, ForbiddenError } from 'apollo-server-express';

import { userResolvers } from './user.resolvers';
import { audioResolvers } from './audio.resolvers';
import { playlistResolvers } from './playlist.resolvers';
import { commentResolvers } from './comment.resolvers';
import { notificationResolvers } from './notification.resolvers';
import { authResolvers } from './auth.resolvers';
import { analyticsResolvers } from './analytics.resolvers';
import { recommendationResolvers } from './recommendation.resolvers';

// Create PubSub instance for subscriptions
export const pubsub = new PubSub();

// Define custom scalars
const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value) {
    return value instanceof Date ? value.toISOString() : value;
  },
  parseValue(value) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  }
});

const jsonScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON custom scalar type',
  serialize(value) {
    return value;
  },
  parseValue(value) {
    return value;
  },
  parseLiteral(ast) {
    switch (ast.kind) {
      case Kind.STRING:
        return JSON.parse(ast.value);
      case Kind.OBJECT:
        return ast.fields.reduce((acc, field) => {
          acc[field.name.value] = field.value.value;
          return acc;
        }, {});
      default:
        return null;
    }
  }
});

// Root resolver
const rootResolver = {
  Upload: GraphQLUpload,
  DateTime: dateTimeScalar,
  JSON: jsonScalar,
  
  // Add resolver implementations to handle inheritance and interfaces
  User: {
    __resolveType(user: any) {
      return 'User';
    }
  },
  
  AudioTrack: {
    __resolveType(track: any) {
      return 'AudioTrack';
    }
  },
  
  Comment: {
    __resolveType(comment: any) {
      return 'Comment';
    }
  },
  
  Playlist: {
    __resolveType(playlist: any) {
      return 'Playlist';
    }
  },
  
  // Add health check query
  Query: {
    healthCheck: () => true
  }
};

// Merge all resolvers
export const resolvers: IResolvers = [
  rootResolver,
  userResolvers,
  audioResolvers,
  playlistResolvers,
  commentResolvers,
  notificationResolvers,
  authResolvers,
  analyticsResolvers,
  recommendationResolvers
];

export default resolvers;