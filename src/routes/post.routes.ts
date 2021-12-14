import express from 'express';
import * as postController from './../controllers/post.controller';
import { createImage } from '../controllers/image.controller';
import { upload } from './../utils/multerConfig';
import * as authController from '../controllers/auth.controller';
import { router as commentRoutes } from '../routes/comment.routes';

export const router = express.Router();

router
  .route('/')
  .get(postController.getAllPosts)
  .post(
    upload.single('image'),
    createImage,
    authController.protectRoutes,
    postController.createPost
  );

router.get('/count', postController.countPosts);

router
  .route('/:id')
  .get(postController.getPost)
  .patch(authController.protectRoutes, postController.updatePost)
  .delete(authController.protectRoutes, postController.deletePost);

// FOR COMMENTS
router.use('/:id/comments', commentRoutes);

router.patch(
  '/:postId/modify-like/:type',
  authController.protectRoutes,
  postController.modifyPostLikes
);
