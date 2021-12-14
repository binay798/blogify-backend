import express, { Request, Response } from 'express';
import { router as userRoutes } from './routes/user.routes';
import { router as postRoutes } from './routes/post.routes';

import { globalErrorHandler } from './controllers/error.controller';
import { middlewares } from './middlewares/middlewares';
import { router as imageRoutes } from './routes/image.routes';
import { router as commentRoutes } from './routes/comment.routes';
import { router as groupRoutes } from './routes/group.routes';
import { router as groupPostRoutes } from './routes/groupPost.routes';

const app = express();

// MIDDLEWARES
middlewares(app);
// API ROUTES

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/images', imageRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/groups', groupRoutes);
app.use('/api/v1/groupPosts', groupPostRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('<h1>Working</h1>');
});

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

export default app;
