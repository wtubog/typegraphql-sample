import { graphql, GraphQLSchema } from 'graphql';
import { Maybe } from 'graphql/jsutils/Maybe';
import { createSchema } from '../../src/utils/create-schema';

interface GCallOptions {
  source: string;
  variableValues: Maybe<{ [key: string]: any }>;
}

let schema: GraphQLSchema;

export const gCall = async (opts: GCallOptions) => {
  if (!schema) {
    schema = await createSchema();
  }
  return graphql({
    schema,
    source: opts.source,
    variableValues: opts.variableValues,
  });
};
