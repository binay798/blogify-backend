import { Request, Response, NextFunction } from 'express';
import { Comment } from './../models/comment.model';
import { catchAsync } from '../utils/catchAsync';
import { Post } from '../models/post.model';
import { UserRequest } from './auth.controller';
import { AppError } from './../utils/AppError';

export const getComments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.id;
    const post = await Post.findById(postId);

    if (!post) return next(new AppError('Post not found', 404));
    await post.populate({ path: 'comments' });

    res.status(200).json({
      status: 'success',
      comments: post.comments,
    });
  }
);

export const createComment = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const postId = req.params.id;
    const userId = req.user.id;
    const { text } = req.body;
    const comment = await Comment.create({ author: userId, text });
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $addToSet: { comments: comment.id },
      },
      { new: true }
    );
    if (!post)
      return next(new AppError('Post not updated while commenting', 404));
    await post.populate({ path: 'comments' });

    res.status(200).json({
      status: 'success',
      comments: post.comments,
    });
  }
);
