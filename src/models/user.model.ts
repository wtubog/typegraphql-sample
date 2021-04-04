import mongoose, { Schema, Document, Model, model, mongo } from 'mongoose';
import { AddUserInput, UpdateUserInput } from '../types';
import * as crypto from 'crypto';

export interface IUser {
  comments: string[];
  posts: string[];
  name: string;
  age: number;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  password: string;
  salt: string;
}

export interface IUserDocument extends IUser, Document {
  /**
   *
   * Checks whether you provided a password and a confirmPassword
   * if true, it'll hash the password
   */
  setPassword(params: AddUserInput | UpdateUserInput): void;
  verifyPassword(password: string): boolean;
}
export interface IUserModel extends Model<IUserDocument> {}

const UserSchema: Schema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      auto: true,
    },
    email: {
      type: Schema.Types.String,
      default: '',
    },
    name: {
      type: Schema.Types.String,
      default: '',
    },
    age: {
      type: Schema.Types.Number,
    },
    comments: {
      ref: 'Comment',
      type: [Schema.Types.String],
      default: [],
    },
    posts: {
      ref: 'Post',
      type: [Schema.Types.String],
      default: [],
    },
    createdAt: {
      type: Schema.Types.Date,
    },
    updatedAt: {
      type: Schema.Types.Date,
    },
    password: {
      type: Schema.Types.String,
      default: null,
    },
    salt: {
      type: Schema.Types.String,
      default: null,
    },
  },
  { timestamps: true }
);

UserSchema.method(
  'setPassword',
  function (this: IUserDocument, params: AddUserInput | UpdateUserInput) {
    if ('password' in params) {
      if ('confirmPassword' in params) {
        console.log({ params });
        if (params.password === params.confirmPassword) {
          if (this.isNew) {
            this.salt = crypto.randomBytes(16).toString('hex');
          }
          this.password = crypto
            .pbkdf2Sync(params.password, this.salt, 1000, 64, 'SHA512')
            .toString(`hex`);
        } else {
          throw new Error('Password did not match');
        }
      } else {
        throw new Error('Please confirm your password');
      }
    }
  }
);

UserSchema.method(
  'verifyPassword',
  function (this: IUserDocument, password: string) {
    const hash = crypto
      .pbkdf2Sync(password, this.salt, 1000, 64, 'SHA512')
      .toString(`hex`);

    return this.password === hash;
  }
);

UserSchema.pre<IUserDocument>('save', async function (next) {
  next();
});

export const UserModel = model<IUserDocument, IUserModel>('User', UserSchema);
