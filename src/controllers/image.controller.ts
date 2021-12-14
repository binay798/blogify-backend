import path from 'path';
import { Express } from 'express';
import { Request, Response, NextFunction } from 'express';
import { Image } from './../models/image.model';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { ApiFeatures } from '../utils/ApiFeatures';
import sharp from 'sharp';
import { generateFileName } from '../utils/generateFileName';
import { deleteFile } from '../utils/deleteFile';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const imagePath = path.resolve(`${__dirname}/../public/images`);

export interface ImageRequest extends Request {
  imageFileName: string;
}

export const createImage = catchAsync(
  async (req: ImageRequest, res: Response, next: NextFunction) => {
    const imageFile = req.file;
    if (!imageFile)
      return next(new AppError('Please input valid image data', 404));
    const imageFileName = generateFileName(imageFile.originalname);
    await sharp(imageFile.buffer)
      .resize({ width: 600 })
      .webp()
      .toFile(`${imagePath}/${imageFileName}`);
    // CONVERT IMAGE TO WEBP THROUGH SHARP JS
    // SAVE IMAGE TO FILE
    // UPLOAD TO DATABASE
    let url;
    let public_id;
    await cloudinary.uploader.upload(
      `${imagePath}/${imageFileName}`,
      async (err, result) => {
        console.log(result);
        if (!result) throw new Error('Not uploaded');

        url = result.url;
        public_id = result.public_id;
      }
    );
    await deleteFile(`${imagePath}/${imageFileName}`);
    if (!url || !public_id)
      return next(new AppError('Image not uploaded', 400));
    await Image.create({ src: url, publicId: public_id });
    req.imageFileName = url;

    next();
  }
);

export const getAllImages = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = new ApiFeatures(Image.find(), req.query)
      .filter()
      .fields()
      .sort()
      .pagination();
    const images = await query.query;

    res.status(200).json({
      status: 'success',
      images,
    });
  }
);

export const deleteImage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const imageId = req.params.id;
    const image = await Image.findById(imageId);
    if (!image) return next(new AppError('No image found', 404));
    const imageName = `${imagePath}/${image?.src}`;
    // await deleteFile(imageName);
    await cloudinary.uploader.destroy(image.publicId);
    await Image.findByIdAndDelete(imageId);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);
