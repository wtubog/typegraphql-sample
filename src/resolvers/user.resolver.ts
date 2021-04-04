import { Error } from 'mongoose';
import {
  Arg,
  Args,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  ResolverInterface,
  Root,
} from 'type-graphql';
import {
  AddUserInput,
  GetUsersArgs,
  LoginResponse,
  PaginatedUsersResponse,
  UpdateUserInput,
  User,
  UserModel,
} from '../types';
import { buildQuery } from '../utils/query-builder';

import * as jwt from 'jsonwebtoken';

@Resolver(User)
export class UserResolver implements ResolverInterface<User> {
  @Query((returns) => User, { nullable: true })
  async user(@Arg('id', { nullable: false }) _id: string): Promise<User> {
    const user = await UserModel.findOne({ _id });

    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  @Query((returns) => PaginatedUsersResponse, { nullable: true })
  async users(@Args() filter: GetUsersArgs): Promise<PaginatedUsersResponse> {
    return buildQuery(
      {
        ...filter,
        searchableFields: ['name', 'email'],
      },
      UserModel.find().populate([
        { path: 'comments', options: { limit: 5 } },
        { path: 'posts', options: { limit: 5 } },
      ])
    );
  }

  @Mutation((returns) => User)
  async addUser(@Arg('data') data: AddUserInput): Promise<User> {
    const user = new UserModel();

    user.name = data.name;
    user.email = data.email;
    user.age = data.age || null;

    user.setPassword(data);
    await user.save();
    return user;
  }

  @Mutation((returns) => User)
  async updateUser(@Arg('id') _id: string, @Arg('data') data: UpdateUserInput) {
    const user = await UserModel.findOne({ _id });
    user.setPassword(data);
    console.log({ user });
    return user.save();
  }

  @FieldResolver()
  posts(@Root('posts') posts) {
    return posts;
  }

  @FieldResolver()
  comments(@Root('comments') comments) {
    return comments;
  }

  @Query((returns) => LoginResponse)
  async login(@Arg('username') email: string, @Arg('password') pw: string) {
    const user = await UserModel.findOne({ email });

    if (!user) {
      throw new Error('Invalid username or password');
    }

    if (!user.verifyPassword(pw)) {
      throw new Error('Invalid username or password');
    }

    return {
      user,
      token: jwt.sign({ _id: user.id, email: user.email }, 'shhh', {}),
    };
  }
}
