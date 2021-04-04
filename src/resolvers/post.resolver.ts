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
  CreatePostInput,
  PaginatedPostsResponse,
  Post,
  PostModel,
  UpdatePostInput,
  User,
  UserModel,
} from '../types';
import { PaginationArgs } from '../types/pagination-args.type';
import { buildQuery } from '../utils/query-builder';
@Resolver(Post)
export class PostResolver implements ResolverInterface<Post> {
  constructor() {
    // console.log({ CommentModel });
  }
  @Query((returns) => PaginatedPostsResponse)
  posts(@Args() filters: PaginationArgs) {
    return buildQuery(
      filters,
      PostModel.find().populate([{ path: 'author' }, { path: 'comments' }])
    );
  }

  @Query((returns) => Post, { nullable: true })
  post(@Arg('id') _id: string) {
    return PostModel.findOne({ _id }).populate([
      { path: 'author' },
      { path: 'comments' },
    ]);
  }

  @FieldResolver()
  async author(@Root('author') _author): Promise<User> {
    return _author;
  }

  @Mutation((type) => Post)
  async createPost(@Arg('data') data: CreatePostInput) {
    const author = await UserModel.findOne({ _id: data.author });

    if (!author) {
      throw new Error('Author not found');
    }

    const post = await PostModel.create({ ...data });
    return post
      .populate([{ path: 'author' }, { path: 'comments' }])
      .execPopulate();
  }

  @Mutation((type) => Post, { nullable: true })
  async updatePost(@Arg('id') _id: string, @Arg('data') data: UpdatePostInput) {
    const post = await PostModel.findOneAndUpdate(
      { _id },
      { $set: data },
      { new: true }
    ).populate([{ path: 'comments' }, { path: 'author' }]);

    return post;
  }

  @Mutation((type) => Post, { nullable: true })
  async deletePost(@Arg('id') _id: string) {
    const post = await PostModel.findOne({ _id }).populate([
      { path: 'comments' },
      { path: 'author' },
    ]);

    if (!post) {
      throw new Error('Post not found');
    }

    return post.remove();
  }
}
