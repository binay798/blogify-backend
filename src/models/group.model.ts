import mongoose from 'mongoose';
import slugify from 'slugify';

export interface Group extends mongoose.Document {
  name: string;
  description: string;
  status: string;
  location: string;
  admin: {
    type: mongoose.Types.ObjectId;
    ref: 'User';
  };
  users: {
    type: mongoose.Types.ObjectId;
    ref: 'User';
  }[];
  photo: string;
  slug: string;
}

const groupSchema = new mongoose.Schema<Group>(
  {
    name: {
      type: String,
      required: [true, 'Must contain name'],
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Must contain description'],
    },
    location: {
      type: String,
      required: [true, 'Must contain location'],
    },
    status: {
      type: String,
      enum: ['public', 'private'],
      required: true,
    },
    admin: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    users: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
      },
    ],
    photo: {
      type: String,
    },
    slug: {
      type: String,
    },
  },
  { timestamps: true }
);

groupSchema.index({ name: 1 });

groupSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

export const Group = mongoose.model('Group', groupSchema);
