import dotenv from 'dotenv';
import mongoose from 'mongoose';
import user from '../models/user.js';

dotenv.config();
mongoose.connect(process.env.DATABASE_URL);

const seed = async () => {
  await user.create({
    userName: 'dcastro',
    password: '123456',
    branch_id: 21,
    email: 'dcastro@gensco.com'
  });
  console.log('user seeded in database!');
  mongoose.disconnect();
};

seed();
