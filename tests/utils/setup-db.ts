import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let conn: typeof mongoose;
let mongod: MongoMemoryServer;

export const setupDb = async () => {
  mongod = new MongoMemoryServer();
  const uri = await mongod.getUri();
  conn = await mongoose.connect(uri);
};

export const closeDb = async () => {
  await conn.disconnect();
  await mongod.stop();
  conn = null;
};
