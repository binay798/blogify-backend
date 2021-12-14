import { Response, NextFunction } from 'express';
import { GroupPost } from '../models/groupPost.model';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { UserRequest } from './auth.controller';
import { Comment } from './../models/comment.model';

export const getAllGroupPost = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const posts = await GroupPost.find({ group: req.params.id }).populate({
      path: 'author',
    });

    res.status(200).json({
      status: 'success',
      posts,
    });
  }
);

export const createGroupPost = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { title, description } = req.body;
    const post = await GroupPost.create({
      title,
      description,
      author: req.user.id,
      group: req.params.id,
      photo: req.imageFileName,
    });
    res.status(200).json({
      status: 'success',
      post,
    });
  }
);

export const updateGroupPost = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const excludedFields = ['author', 'likes', 'photo', 'group'];
    excludedFields.forEach((el) => {
      delete req.body[el];
    });
    const postId = req.params.postId;
    const authorId = req.user.id;

    const post = await GroupPost.findOneAndUpdate(
      { _id: postId, author: authorId },
      req.body,
      { new: true }
    );
    if (!post) return next(new AppError('Couldnot update this post', 401));

    res.status(200).json({
      status: 'success',
      post,
    });
  }
);

export const deleteGroupPost = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    // GET POST ID AND USER ID
    const postId = req.params.postId;
    const userId = req.user.id;
    // GET GROUP OF THE POST
    const post = await GroupPost.findById(postId).populate({
      path: 'group',
      select: 'admin',
    });
    if (!post) return next(new AppError('Post not found', 404));
    // GET ADMIN OF THE GROUP
    const adminOfGroup = post.group.admin.toString();

    // IF ADMIN DELETE POST BY ID
    if (userId === adminOfGroup) {
      await GroupPost.findByIdAndDelete(postId);
      // IF AUTHOR DELETE POST
    } else if (userId === post.author.toString()) {
      await GroupPost.findByIdAndDelete(postId);
    } else {
      return next(new AppError('Cannot delete this post', 401));
    }
    res.status(204).json({
      status: 'success',
    });
  }
);

export const getComments = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const postId = req.params.postId;
    const post = await GroupPost.findById(postId);
    if (!post) return next(new AppError('Post not found', 404));
    await post.populate({ path: 'comments' });
    res.status(200).json({
      status: 'success',
      comments: post.comments,
    });
  }
);

export const createGroupPostComment = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { text } = req.body;
    const postId = req.params.postId;
    const isTherePost = await GroupPost.findById(postId);
    if (!isTherePost) return next(new AppError('Post not found', 404));
    // CREATE COMMENT
    if (!text) return next(new AppError('Enter valid commment', 400));
    const comment = await Comment.create({ author: req.user.id, text: text });

    // SAVE TO GROUP POST
    const post = await GroupPost.findByIdAndUpdate(
      postId,
      {
        $addToSet: { comments: comment.id },
      },
      { new: true }
    );
    if (!post) return next(new AppError('Post not found', 404));
    await post.populate({ path: 'comments' });
    res.status(200).json({ status: 'success', comments: post.comments });
  }
);

export const modifyPostLikes = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { type, postId } = req.params;
    let post;
    if (type === 'like') {
      // LIKE POST
      post = GroupPost.findByIdAndUpdate(
        postId,
        { $addToSet: { likes: req.user.id } },
        { new: true }
      );
    } else if (type === 'dislike') {
      // UNLIKE POST
      post = GroupPost.findByIdAndUpdate(
        postId,
        { $pull: { likes: req.user.id } },
        { new: true }
      );
    }
    if (!post) return next(new AppError('Post not found', 404));
    post = await post.populate({ path: 'author' });

    res.status(200).json({
      status: 'success',
      post,
    });
  }
);
