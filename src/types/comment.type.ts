import { getModelForClass, post, prop, Ref } from '@typegoose/typegoose';
import { Schema } from 'mongoose';
import { ObjectType, Field, InputType } from 'type-graphql';
import { Post, PostModel } from './post.type';
import { User, UserModel } from './user.type';

@ObjectType()
@post<Comment>('save', async function (doc, next) {
  if (doc.isNew) {
    await Promise.all([
      UserModel.findOneAndUpdate(
        { _id: doc.author as string },
        { $push: { comments: doc._id } }
      ),
      PostModel.findOneAndUpdate(
        { _id: doc.post as string },
        { $push: { comments: doc._id } }
      ),
    ]);

    next();
  }

  next();
})
@post<Comment>('remove', async function (doc, next) {
  await Promise.all([
    UserModel.findOneAndUpdate(
      { _id: doc.author as string },
      { $pull: { comments: doc._id } }
    ),
    PostModel.findOneAndUpdate(
      { _id: doc.post as string },
      { $pull: { comments: doc._id } }
    ),
  ]);
  next();
})
export class Comment {
  @Field()
  _id: string;

  @Field()
  @prop()
  text: string;

  @Field((type) => User)
  @prop({ ref: 'User', type: Schema.Types.ObjectId })
  author: Ref<User>;

  @Field((type) => Post)
  @prop({ ref: 'Post', type: Schema.Types.ObjectId })
  post: Ref<Post>;
}

export const CommentModel = getModelForClass(Comment);

@InputType()
export class CreateCommentInput {
  @Field()
  text: string;

  @Field()
  author: string;

  @Field()
  post: string;
}

@InputType()
export class UpdateCommentInput {
  @Field()
  text: string;
}
