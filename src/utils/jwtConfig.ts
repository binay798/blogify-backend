import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { Document } from 'mongoose';

const cookieOptions = {
  maxAge: 24 * 60 * 60 * 1000,
  httpOnly: false,
  secure: false,
  sameSite: 'none' as 'none',
};
const jwtOptions = {
  expiresIn: process.env.JWT_EXPIRES_IN,
};

export function sendResponse(res: Response, user: Document): void {
  const token = jwt.sign({ id: user.id }, 'this-is-my-secret', jwtOptions);
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
    cookieOptions.httpOnly = true;
  }
  res.cookie('jwt', token, cookieOptions);
  res.status(200).json({
    status: 'success',
    user,
    token,
  });
}
