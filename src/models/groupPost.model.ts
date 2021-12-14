import mongoose from 'mongoose';

const groupPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Must contain title'],
      unique: true,
      maxLength: 200,
    },
    group: {
      type: mongoose.Types.ObjectId,
      ref: 'Group',
      required: [true, 'Must contain group'],
    },
    photo: {
      type: String,
      required: [true, 'Must contain photo'],
    },
    description: {
      type: String,
    },
    likes: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    author: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    comments: [{ type: mongoose.Types.ObjectId, ref: 'Comment' }],
  },
  { timestamps: true }
);

export const GroupPost = mongoose.model('GroupPost', groupPostSchema);
