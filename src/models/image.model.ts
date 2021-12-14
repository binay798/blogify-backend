import mongoose from 'mongoose';

interface ImageSchema {
  src: string;
  publicId: string;
  createdAt: Date;
  updatedAt: Date;
}

const imageSchema = new mongoose.Schema<ImageSchema>(
  {
    src: {
      type: String,
    },
    publicId: String,
  },
  { timestamps: true }
);

export const Image = mongoose.model('Image', imageSchema);
