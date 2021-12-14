import express from 'express';
import * as commentController from './../controllers/comment.controller';
import { protectRoutes } from '../controllers/auth.controller';

export const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(commentController.getComments)
  .post(protectRoutes, commentController.createComment);
