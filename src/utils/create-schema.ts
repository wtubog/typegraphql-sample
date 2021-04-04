import { GraphQLSchema } from 'graphql';
import { buildSchema } from 'type-graphql';
import { CommentResolver } from '../resolvers/comment.resolver';
import { PostResolver } from '../resolvers/post.resolver';
import { UserResolver } from '../resolvers/user.resolver';

let schema: GraphQLSchema;

export const createSchema = async () => {
  if (!schema) {
    schema = await buildSchema({
      resolvers: [UserResolver, PostResolver, CommentResolver],
    });
  }
  return schema;
};
