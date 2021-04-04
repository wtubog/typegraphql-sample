import {
  DocumentType,
  getModelForClass,
  modelOptions,
  prop,
  Ref,
} from '@typegoose/typegoose';
import { Schema } from 'mongoose';
import { ArgsType, Field, ID, InputType, Int, ObjectType } from 'type-graphql';
import { Comment } from './comment.type';
import { PaginatedResponse, PaginationArgs } from './pagination-args.type';
import { Post } from './post.type';
import * as crypto from 'crypto';
import { IsEmail, isEmail, MinLength } from 'class-validator';
@ObjectType()
@modelOptions({ schemaOptions: { timestamps: true } })
export class User {
  @Field((type) => ID)
  _id: string;

  @Field()
  @prop({ type: Schema.Types.String })
  name: string;

  @Field({})
  @prop({ type: Schema.Types.String, unique: true })
  email: string;

  @Field((type) => Int, { nullable: true })
  @prop({ type: Schema.Types.Number })
  age: number;

  @Field((type) => [Post], { nullable: false })
  @prop({ type: [Schema.Types.ObjectId], ref: 'Post' })
  posts: Ref<Post>[];

  @Field((type) => [Comment], { nullable: false })
  @prop({ type: [Schema.Types.ObjectId], ref: 'Comment' })
  comments: Ref<Comment>[];

  @Field()
  @prop({ type: Schema.Types.Date })
  createdAt: Date;

  @Field()
  @prop({ type: Schema.Types.Date })
  updatedAt: Date;

  @prop({ type: Schema.Types.String })
  salt: string;

  @prop({ type: Schema.Types.String })
  password: string;

  setPassword(
    this: DocumentType<User>,
    params: AddUserInput | UpdateUserInput
  ) {
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

  verifyPassword(this: DocumentType<User>, password: string) {
    const hash = crypto
      .pbkdf2Sync(password, this.salt, 1000, 64, 'SHA512')
      .toString(`hex`);

    return this.password === hash;
  }
}

export const UserModel = getModelForClass(User);

@InputType({ description: 'add a user' })
export class AddUserInput {
  @Field()
  name: string;

  @Field()
  @IsEmail()
  email: string;

  @Field((type) => Int, { nullable: true })
  age?: number;

  @Field()
  @MinLength(8)
  password: string;

  @Field()
  confirmPassword: string;
}

@InputType({ description: 'updates a user' })
export class UpdateUserInput {
  @Field({ nullable: true })
  name?: string;

  @Field((type) => Int, { nullable: true })
  age?: number;

  @Field({ nullable: true })
  password?: string;

  @Field({ nullable: true })
  confirmPassword?: string;
}

@ArgsType()
export class GetUsersArgs extends PaginationArgs {}

@ObjectType()
export class PaginatedUsersResponse extends PaginatedResponse(User) {}

@ObjectType()
export class LoginResponse {
  @Field((type) => User)
  user: User;

  @Field()
  token: string;
}
