import { Request, Response, NextFunction } from 'express';
import { Group } from '../models/group.model';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import { ApiFeatures } from '../utils/ApiFeatures';
import { UserRequest } from './auth.controller';

export const getAllGroups = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = new ApiFeatures(Group.find(), req.query)
      .filter()
      .fields()
      .sort()
      .pagination();

    const groups = await query.query;
    res.status(200).json({
      status: 'success',
      results: groups.length,
      groups,
    });
  }
);

export const searchGroup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const groupName = req.params.name;
    const groups = await Group.find({
      name: new RegExp(groupName, 'i'),
    });
    res.status(200).json({
      status: 'success',
      groups,
    });
  }
);
export const countGroups = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const groups = await Group.countDocuments();
    res.status(200).json({
      status: 'success',
      groups,
    });
  }
);

export const createGroup = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { name, status, description, location } = req.body;
    const userId: string = req.user.id;
    const group = await Group.create({
      name,
      status,
      admin: userId,
      description,
      location,
      photo: req.imageFileName,
    });

    res.status(200).json({
      status: 'success',
      group,
    });
  }
);

export const getGroup = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const group = await Group.findById(id);
    if (!group) return next(new AppError('Group not found', 404));
    await group.populate({ path: 'admin' });
    res.status(200).json({
      status: 'success',
      group,
    });
  }
);

export const deleteGroup = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    await Group.findByIdAndDelete(id);

    res.status(204).json({
      status: 'success',
    });
  }
);

export const joinGroup = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const userId: string = req.user.id;
    const { name } = req.params;
    const group = await Group.findOneAndUpdate(
      { slug: name },
      { $addToSet: { users: userId } },
      { new: true }
    );
    if (!group) return next(new AppError('Group not found', 404));
    await group.populate({ path: 'admin' });
    res.status(200).json({
      status: 'success',
      group,
    });
  }
);

export const leaveGroup = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const userId: string = req.user.id;
    const { name } = req.params;
    const group = await Group.findOneAndUpdate(
      { slug: name },
      { $pull: { users: userId } },
      { new: true }
    );
    if (!group) return next(new AppError('Group not found', 404));
    await group.populate({ path: 'admin' });
    res.status(200).json({
      status: 'success',
      group,
    });
  }
);

// NEEDS TO BE REFACTORED!!!!!!!!!!
export const updateGroup = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const excludedFields = ['users', 'slug'];
    excludedFields.forEach((el) => {
      delete req.body[el];
    });

    const group = await Group.findByIdAndUpdate(req.group.id, req.body, {
      new: true,
    });
    if (!group) return next(new AppError('Group not updated', 400));
    await group.save();
    res.status(200).json({
      status: 'success',
      group,
    });
  }
);

export const checkIfGroupAdmin = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const group = await Group.findById(id);
    if (!group) return next(new AppError('Group not found', 404));
    if (req.user.id !== group.admin.toString())
      return next(new AppError('Not authorized', 401));
    req.group = group;

    next();
  }
);

export const changeGroupPhoto = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const group = await Group.findByIdAndUpdate(
      req.group.id,
      { photo: req.imageFileName },
      { new: true }
    );
    res.status(200).json({
      status: 'success',
      group,
    });
  }
);

export const checkIfUserBelongToTheGroup = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const groupId = req.params.id;
    const userId = req.user.id;
    const isAdmin = await Group.findOne({ _id: groupId, admin: userId });
    if (isAdmin) {
      return next();
    }
    const group = await Group.findOne({ _id: groupId, users: userId });
    if (!group)
      return next(new AppError('You donot have any access to this group', 400));

    next();
  }
);

export const getAllJoinedGroup = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const groups = await Group.find({ users: userId });

    res.status(200).json({
      status: 'success',
      groups,
    });
  }
);
