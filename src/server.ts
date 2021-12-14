import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(`${__dirname}/config.env`) });
import app from './app';
import mongoose from 'mongoose';

const DB = process.env.DATABASE || 'sth';
// CONNECT TO DATABASE
mongoose
  .connect(DB)
  .then((con) => console.log('Connection successful'))
  .catch((err) => console.log(err.message));

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`Server running at port ${PORT}`));
