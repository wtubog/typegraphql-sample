import { createSchema } from './utils/create-schema';
import { initDb } from './utils/db';

export const bootstrap = () => {
  return Promise.all([createSchema(), initDb()]);
};
