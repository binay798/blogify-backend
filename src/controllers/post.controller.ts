import { Request, Response, NextFunction } from 'express';
import { Post } from './../models/post.model';
import { catchAsync } from './../utils/catchAsync';
import { ApiFeatures } from '../utils/ApiFeatures';
import { AppError } from './../utils/AppError';
import { ImageRequest } from './../controllers/image.controller';
import { UserRequest } from './auth.controller';
// CREATE POST
export const createPost = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const post = await Post.create({
      ...req.body,
      photo: req.imageFileName,
      author: req.user.id,
    });
    await post.populate({
      path: 'author',
      select: 'firstname lastname photo',
    });
    res.status(200).json({
      status: 'success',
      post,
    });
  }
);
export const countPosts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const posts = await Post.countDocuments();
    res.status(200).json({
      status: 'success',
      posts,
    });
  }
);

export const getAllPosts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = new ApiFeatures(Post.find(), req.query)
      .filter()
      .fields()
      .sort()
      .pagination()
      .populate();

    const posts = await query.query;
    res.status(200).json({
      status: 'success',
      results: posts.length,
      posts,
    });
  }
);

export const getPost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) return next(new AppError('Post not found', 404));
    res.status(200).json({
      status: 'success',
      post,
    });
  }
);

export const updatePost = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user.id;

    const excludedFields = ['author', 'createdAt', 'updatedAt', 'likes'];
    const reqBody = { ...req.body };
    excludedFields.forEach((el) => {
      delete reqBody[el];
    });
    const post = await Post.findOneAndUpdate(
      { _id: id, author: userId },
      reqBody,
      { new: true }
    );

    if (!post) return next(new AppError('Not authorized', 401));

    res.status(200).json({
      status: 'success',
      post,
    });
  }
);

export const deletePost = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user.id;
    const post = await Post.findOneAndDelete({ _id: id, author: userId });
    if (!post) return next(new AppError('Not found', 404));
    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);

export const modifyPostLikes = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { type, postId } = req.params;
    let post;
    if (type === 'like') {
      // LIKE POST
      post = Post.findByIdAndUpdate(
        postId,
        { $addToSet: { likes: req.user.id } },
        { new: true }
      );
    } else if (type === 'dislike') {
      // UNLIKE POST
      post = Post.findByIdAndUpdate(
        postId,
        { $pull: { likes: req.user.id } },
        { new: true }
      );
    }
    post = await post;
    if (!post) return next(new AppError('Post not found', 404));
    await post.populate({
      path: 'author',
      select: 'firstname lastname photo',
    });

    res.status(200).json({
      status: 'success',
      post,
    });
  }
);
