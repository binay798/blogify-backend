import path from 'path';
import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

const staticFilePath = path.resolve(`${__dirname}/../public`);

export function middlewares(app: Express): void {
  app.use(
    cors({
      origin: ['http://localhost:3000', 'http://192.168.1.28:3000'],
      credentials: true,
    })
  );
  app.use('/static', express.static(staticFilePath));
  app.use(morgan('dev'));

  app.use(express.json());
  app.use(cookieParser());
}
