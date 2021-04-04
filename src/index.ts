import { ApolloServer } from 'apollo-server';
import 'reflect-metadata';
import { bootstrap } from './bootstrap';

(async () => {
  const [schema] = await bootstrap();
  // Create GraphQL server
  const server = new ApolloServer({
    playground: true,
    schema,
    // you can pass the endpoint path for subscriptions
    // otherwise it will be the same as main graphql endpoint
    // subscriptions: "/subscriptions",
  });

  // Start the server
  const { url } = await server.listen(8888);
  console.log(`Server is running, GraphQL Playground available at ${url}`);
})();
