import express from 'express';
import * as groupPostController from './../controllers/groupPost.controller';
import { checkIfUserBelongToTheGroup } from '../controllers/group.controller';
import { protectRoutes } from '../controllers/auth.controller';
import { upload } from '../utils/multerConfig';
import { createImage } from '../controllers/image.controller';

export const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(groupPostController.getAllGroupPost)
  .post(
    protectRoutes,
    checkIfUserBelongToTheGroup,
    upload.single('image'),
    createImage,
    groupPostController.createGroupPost
  );

router
  .route('/:postId')
  .patch(protectRoutes, groupPostController.updateGroupPost)
  .delete(protectRoutes, groupPostController.deleteGroupPost);

router.post(
  '/:postId/comment',
  protectRoutes,
  checkIfUserBelongToTheGroup,
  groupPostController.createGroupPostComment
);
router.patch(
  '/:postId/:type',
  protectRoutes,
  groupPostController.modifyPostLikes
);
router.get('/:postId/comments', protectRoutes, groupPostController.getComments);
