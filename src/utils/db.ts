import mongoose from 'mongoose';
import { secretService } from './secret-service';

let dbInitialized = false;

export const initDb = async (options?: mongoose.ConnectOptions) => {
  let uri = 'mongodb://127.0.0.1:27017';
  let db: typeof mongoose;
  if (process.env.AWS_REGION) {
    // AWS db confg
    uri = await secretService(`/ringy/db/${process.env.STAGE}`, true).then(
      (v) => v.Parameter.Value
    );
  }

  if (!dbInitialized) {
    db = await mongoose.connect(uri, {
      useCreateIndex: true,
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ...options,
      dbName: 'posts',
    });

    dbInitialized = true;
  }

  return db;
};
