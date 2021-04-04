import { getModelForClass, post, prop, Ref } from '@typegoose/typegoose';
import { Schema } from 'mongoose';
import { ObjectType, Field, InputType } from 'type-graphql';
import { Comment, CommentModel } from './comment.type';
import { PaginatedResponse } from './pagination-args.type';
import { User, UserModel } from './user.type';

@ObjectType()
@post<Post>('save', async function (doc, next) {
  if (doc.isNew) {
    await UserModel.findOneAndUpdate(
      { _id: doc.author as string },
      { $push: { posts: doc._id } }
    );
  }
  next();
})
@post<Post>('remove', async function (doc, next) {
  await Promise.all([
    CommentModel.deleteMany({ _id: { $in: doc.comments as string[] } }),
    UserModel.findOneAndUpdate(
      { _id: doc.author as string },
      { $pull: { posts: doc._id } }
    ),
  ]);
  next();
})
export class Post {
  @Field()
  _id: string;

  @Field()
  @prop()
  title: string;

  @Field((type) => User)
  @prop({ type: Schema.Types.ObjectId, ref: 'User' })
  author: Ref<User>;

  @Field((type) => [Comment])
  @prop({ type: Schema.Types.ObjectId, ref: 'Comment' })
  comments: Ref<Comment>[];

  @Field()
  @prop()
  body: string;
}

export const PostModel = getModelForClass(Post);

@InputType()
export class CreatePostInput {
  @Field()
  title: string;

  @Field()
  body: string;

  @Field()
  author: string;
}

@InputType()
export class UpdatePostInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  body?: string;
}

@ObjectType()
export class PaginatedPostsResponse extends PaginatedResponse(Post) {}
