import { ApolloServer } from 'apollo-server-lambda';
import {
  APIGatewayProxyEvent,
  Callback,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { Context } from 'node:vm';
import { bootstrap } from './bootstrap';

export const createHandler = async () => {
  const [schema] = await bootstrap();

  const server = new ApolloServer({
    schema,
    playground: {
      endpoint: `/${process.env.STAGE}/graphql`,
    },
    context: ({ event, context }) => ({
      headers: event.headers,
      functionName: context.functionName,
      event,
      context,
    }),
  });

  return server.createHandler({
    cors: {
      origin: '*',
      credentials: true,
    },
  });
};

export const graphqlHandler = (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback<APIGatewayProxyResult>
) => {
  createHandler().then((handler: any) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return handler(event, context, callback);
  });
};
