import crypto from 'crypto';
import { User, UserSchema } from '../models/user.model';
import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/jwtConfig';
import { AppError } from './../utils/AppError';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { EmailConfig } from '../utils/emailConfig';
import { Group } from './../models/group.model';

export interface UserRequest extends Request {
  user: UserSchema;
  imageFileName: string;
  group: Group;
}

interface NewJwtPayload extends JwtPayload {
  id: string;
  iat: number;
}
export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.create(req.body);

    // Send welcome email
    const emailInstance = new EmailConfig(
      process.env.EMAIL_USERNAME as string,
      user.email,
      {
        subject: 'Welcome to our website',
      }
    );
    emailInstance.welcomeEmail();

    sendResponse(res, user);
  }
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // GET EMAIL AND PASSWORD
    const { email, password } = req.body;
    // CHECK FOR EXISTENCE OF USER BELONGING TO THE EMAIL
    const user = await User.findOne({ email }).select('+password');
    if (!user) return next(new AppError('User doesnot exist', 404));
    const { password: mainPassword } = user;
    // COMPARE PASSWORD
    const isPasswordCorrect = await user.comparePassword(
      password,
      mainPassword
    );
    if (!isPasswordCorrect)
      return next(new AppError('Email or password doesnot match', 404));
    // SEND RESPONSE
    sendResponse(res, user);
  }
);

export const logout = catchAsync(async (req: Request, res: Response) => {
  res.cookie('jwt', '');
  res.status(200).json({
    status: 'success',
    token: '',
  });
});

export const protectRoutes = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    // CHECK AUTHORIZATION HEADERS FOR JWT
    const cookie = req.headers.cookie;
    if (!cookie || cookie.split('=')[1] === '')
      return next(new AppError('Not authorized', 404));

    const decoded = (await jwt.verify(
      cookie.split('=')[1],
      'this-is-my-secret'
    )) as NewJwtPayload;
    if (!decoded) return next(new AppError('Invalid token', 400));
    const user = await User.findById(decoded.id);

    if (!user) return next(new AppError('User not found', 404));
    const passwordResetDate = user.passwordResetDate;
    if (decoded.iat * 1000 < passwordResetDate)
      return next(new AppError('Authentication failed', 401));
    req.user = user;

    next();
  }
);

export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // GET THE EMAIL
    const { email } = req.body;
    // CHECK FOR THE EXISTENCE OF USER
    const user = await User.findOne({ email });
    if (!user) return next(new AppError('User not found', 404));
    // CREATE RESET URL
    const resetToken = user.createPasswordResetUrl();
    user.save({ validateBeforeSave: false });
    // SEND RESET URL TO THE EMAIL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const emailInstance = new EmailConfig(
      process.env.EMAIL_USERNAME as string,
      email,
      {
        url: resetUrl,
        subject: 'Reset your password',
      }
    );
    await emailInstance.passwordResetEmail();

    res.status(200).json({
      status: 'success',
      message: 'Please check your email',
    });
  }
);

export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;
    if (!token) return next(new AppError('Invalid token', 400));

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetDate: { $gt: Date.now() },
    });

    if (!user) return next(new AppError('Invalid token', 400));
    user.password = password;
    user.confirmPassword = confirmPassword;

    user.passwordResetToken = '';
    await user.save();
    res.status(200).json({
      status: 'success',
      message: 'Password successfully changed',
    });
  }
);
