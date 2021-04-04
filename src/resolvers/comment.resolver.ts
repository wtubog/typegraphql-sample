import {
  Arg,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  ResolverInterface,
  Root,
} from 'type-graphql';
import {
  Comment,
  CommentModel,
  CreateCommentInput,
  UpdateCommentInput,
} from '../types/comment.type';
import { PostModel } from '../types/post.type';
import { UserModel } from '../types/user.type';

@Resolver(Comment)
export class CommentResolver implements ResolverInterface<Comment> {
  @Query((returns) => [Comment])
  comments() {
    return CommentModel.find().populate([{ path: 'post' }, { path: 'author' }]);
  }

  @Query((returns) => Comment, { nullable: true })
  comment(@Arg('id') _id: string) {
    return CommentModel.findOne({ _id }).populate([
      { path: 'post' },
      { path: 'author' },
    ]);
  }

  @FieldResolver()
  author(@Root('author') author) {
    return author;
  }

  @FieldResolver()
  post(@Root('post') post) {
    return post;
  }

  @Mutation((returns) => Comment)
  async addComment(@Arg('data') data: CreateCommentInput) {
    const [author, post] = await Promise.all([
      UserModel.exists({ _id: data.author }),
      PostModel.exists({ _id: data.post }),
    ]);

    if (!author || !post) {
      throw new Error('Author or Post not found');
    }

    return CommentModel.create(data).then((comment) =>
      comment.populate([{ path: 'post' }, { path: 'author' }]).execPopulate()
    );
  }

  @Mutation((returns) => Comment)
  async updateComment(
    @Arg('id') _id: string,
    @Arg('data') data: UpdateCommentInput
  ) {
    const comment = await CommentModel.findOneAndUpdate(
      { _id },
      { $set: data }
    ).populate([[{ path: 'post' }, { path: 'author' }]]);

    return comment;
  }

  @Mutation((returns) => Comment)
  async deleteComment(@Arg('id') _id: string) {
    const comment = await CommentModel.findOne({ _id }).populate([
      [{ path: 'post' }, { path: 'author' }],
    ]);

    if (!comment) {
      throw new Error('Comment not found');
    }

    return comment.remove();
  }
}
