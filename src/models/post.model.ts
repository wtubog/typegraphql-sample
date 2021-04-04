import { Schema, Document, Model, model, Query } from 'mongoose';
import { CommentModel } from '../types/comment.type';
import { UserModel } from '../types/user.type';

export interface IPost {
  title: string;
  body: string;
  author: string;
  comments: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IPostDocument extends IPost, Document {}
export interface IPostModel extends Model<IPostDocument> {}

const PostSchema: Schema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      auto: true,
    },
    title: {
      type: Schema.Types.String,
      default: '',
    },
    body: {
      type: Schema.Types.String,
    },
    author: {
      ref: 'User',
      type: Schema.Types.ObjectId,
    },
    comments: {
      ref: 'Comment',
      type: [Schema.Types.ObjectId],
      default: [],
    },
    createdAt: {
      type: Schema.Types.Date,
    },
    updatedAt: {
      type: Schema.Types.Date,
    },
  },
  { timestamps: true }
);

// PostSchema.pre<IPostDocument>('save', async function (next) {
//   this.createdAt = new Date();
//   this.updatedAt = new Date();
//   next();
// });

// PostSchema.post<Query<IPostDocument, IPostDocument>>('findOneAndUpdate', async function (doc,) {
//   console.log({this: this})
//   next();
// });

PostSchema.post('save', async (doc, next) => {
  await UserModel.findOneAndUpdate(
    { _id: doc.author },
    { $push: { posts: doc._id } }
  );
  next();
});

PostSchema.post('remove', async (doc, next) => {
  await Promise.all([
    CommentModel.deleteMany({ _id: { $in: doc.comments } }),
    UserModel.findOneAndUpdate(
      { _id: doc.author },
      { $pull: { posts: doc._id } }
    ),
  ]);
  next();
});

export const PostModel = model<IPostDocument, IPostModel>('Post', PostSchema);
