import { Request, Response, NextFunction } from 'express';
import { catchAsync } from './../utils/catchAsync';
import { User } from './../models/user.model';
import { ApiFeatures } from './../utils/ApiFeatures';
import { UserRequest } from './auth.controller';
import { AppError } from '../utils/AppError';

export const getAllUsers = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const query = new ApiFeatures(User.find(), req.query)
      .filter()
      .fields()
      .sort()
      .pagination();

    const users = await query.query;
    res.status(200).json({
      status: 'success',
      users,
    });
  }
);

export const searchUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userName = req.params.name;
    // const users = await User.find({
    //   firstname: new RegExp(userName, 'i'),
    // });
    const users = await User.find({
      $or: [
        { firstname: new RegExp(userName, 'i') },
        { username: new RegExp(userName, 'i') },
      ],
    });
    res.status(200).json({
      status: 'success',
      users,
    });
  }
);

export const countUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.countDocuments();
    res.status(200).json({
      status: 'success',
      users,
    });
  }
);

export const getUser = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found', 404));

    res.status(200).json({
      status: 'success',
      user,
    });
  }
);

// UPDATE USERS
export const updateUser = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    // COULD UPDATE EMAIL USERNAME AND PHOTO
    const requestBody = { ...req.body };
    // REMOVE PASSWORD AND CONFIRMPASSWORD FIELD IF PRESENT
    const excludedFields = ['password', 'confirmPassword', 'photo'];
    excludedFields.forEach((el) => {
      delete requestBody[el];
    });
    const userId = req.user.id;
    const user = await User.findByIdAndUpdate(userId, requestBody, {
      new: true,
    });
    res.status(200).json({
      status: 'success',
      user,
    });
  }
);

// UPDATE PROFILE PICTURE
export const updateProfilePicture = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const imageFileName = req.imageFileName;
    if (!imageFileName) return next(new AppError('Image not found', 404));
    const userId = req.user.id;
    if (!userId) return next(new AppError('Invalid user id', 404));
    const user = await User.findByIdAndUpdate(
      userId,
      { photo: imageFileName },
      { new: true }
    );
    res.status(200).json({
      status: 'success',
      user,
    });
  }
);
