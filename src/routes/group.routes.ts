import express from 'express';
import * as groupController from './../controllers/group.controller';
import { protectRoutes } from '../controllers/auth.controller';
import { upload } from '../utils/multerConfig';
import { createImage } from '../controllers/image.controller';
import { router as groupPostRoutes } from './groupPost.routes';

export const router = express.Router();

router
  .route('/')
  .get(groupController.getAllGroups)
  .post(
    protectRoutes,
    upload.single('image'),
    createImage,
    groupController.createGroup
  );

router.get(
  '/get-joined-groups',
  protectRoutes,
  groupController.getAllJoinedGroup
);
router.get('/count', groupController.countGroups);
router.get('/search/:name', groupController.searchGroup);

router
  .route('/:id')
  .get(groupController.getGroup)
  .delete(
    protectRoutes,
    groupController.checkIfGroupAdmin,
    groupController.deleteGroup
  )
  .patch(
    protectRoutes,
    groupController.checkIfGroupAdmin,
    groupController.updateGroup
  );

router.post('/:name/join', protectRoutes, groupController.joinGroup);
router.post('/:name/leave', protectRoutes, groupController.leaveGroup);

router.patch(
  '/:id/update-photo',
  protectRoutes,
  groupController.checkIfGroupAdmin,
  upload.single('image'),
  createImage,
  groupController.changeGroupPhoto
);

// ROUTES FOR GROUP POST
router.use('/:id/group-post', groupPostRoutes);
