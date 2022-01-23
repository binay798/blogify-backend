import express from 'express';
import * as authController from '../controllers/auth.controller';
import * as userController from '../controllers/user.controller';
import { upload } from './../utils/multerConfig';
import { createImage } from './../controllers/image.controller';

export const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router
  .route('/')
  .get(authController.protectRoutes, userController.getAllUsers)
  .patch(authController.protectRoutes, userController.updateUser);

router.get('/count', userController.countUsers);
router.get('/search/:name', userController.searchUser);

router
  .route('/update-pic')
  .patch(
    authController.protectRoutes,
    upload.single('image'),
    createImage,
    userController.updateProfilePicture
  );

router.get('/forgot-password', authController.forgotPassword);
router.get('/:id', userController.getUser);

router.post('/reset-password/:token', authController.resetPassword);
