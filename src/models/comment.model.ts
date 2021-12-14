import mongoose from 'mongoose';

interface CommentSchema extends mongoose.Document {
  author: {
    type: mongoose.Types.ObjectId;
    ref: string;
  };
  text: string;
}

const commentSchema = new mongoose.Schema<CommentSchema>(
  {
    author: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Must contain author'],
    },
    text: {
      type: String,
      required: [true, 'Must contain text'],
    },
  },
  { timestamps: true }
);

commentSchema.pre(/find/, function (next) {
  this.populate('author');
  next();
});

export const Comment = mongoose.model('Comment', commentSchema);
