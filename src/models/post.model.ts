import mongoose from 'mongoose';

export interface PostSchema extends mongoose.Document {
  title: string;
  author: {
    type: typeof mongoose.Types.ObjectId;
    ref: string;
  };
  photo: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  comments: [{ type: mongoose.Types.ObjectId; ref: 'Comment' }];
  likes: [{ type: mongoose.Types.ObjectId; ref: 'User' }];
}

const postSchema = new mongoose.Schema<PostSchema>(
  {
    title: {
      type: String,
      required: [true, 'Must contain title'],
    },
    author: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Must contain author'],
    },
    photo: {
      type: String,
      required: [true, 'Must contain photo'],
    },
    description: {
      type: String,
      required: [true, 'Must contain description'],
    },
    likes: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    comments: [{ type: mongoose.Types.ObjectId, ref: 'Comment' }],
  },
  { timestamps: true }
);

export const Post = mongoose.model('Post', postSchema);
