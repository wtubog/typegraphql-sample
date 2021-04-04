import { Schema, Document, Model, model } from 'mongoose';
import { PostModel } from '../types/post.type';
import { UserModel } from '../types/user.type';

export interface IComment {
  text: string;
  author: string;
  post: string;
}

export interface ICommentDocument extends IComment, Document {}
export interface ICommentModel extends Model<ICommentDocument> {}

const CommentSchema: Schema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      auto: true,
    },
    text: {
      type: Schema.Types.String,
      default: '',
    },
    author: {
      ref: 'User',
      type: Schema.Types.String,
    },
    post: {
      ref: 'Post',
      type: Schema.Types.String,
    },
  },
  { timestamps: true }
);

CommentSchema.post('save', async (doc, next) => {
  await Promise.all([
    UserModel.findOneAndUpdate(
      { _id: doc.author },
      { $push: { comments: doc._id } }
    ),
    PostModel.findOneAndUpdate(
      { _id: doc.post },
      { $push: { comments: doc._id } }
    ),
  ]);

  next();
});

CommentSchema.post('remove', async (doc, next) => {
  await Promise.all([
    UserModel.findOneAndUpdate(
      { _id: doc.author },
      { $pull: { comments: doc._id } }
    ),
    PostModel.findOneAndUpdate(
      { _id: doc.post },
      { $pull: { comments: doc._id } }
    ),
  ]);

  next();
});

export const CommentModel = model<ICommentDocument, ICommentModel>(
  'Comment',
  CommentSchema
);
