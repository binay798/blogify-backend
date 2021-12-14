import express from 'express';
import * as imageController from './../controllers/image.controller';
import { upload } from './../utils/multerConfig';

export const router = express.Router();

router
  .route('/')
  .get(imageController.getAllImages)
  .post(upload.single('image'), imageController.createImage);

router.route('/:id').delete(imageController.deleteImage);
