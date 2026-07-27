import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import sessions from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';

import checkRoutes from './routes/healthcheck';
import userRoutes from './routes/user';
import sessionRoutes from './routes/session';
import offerRoutes from './routes/offer';
import { errorHandler } from './middlewares/errorHandler';
import { MONGO_URI, SECRET_KEY } from './config/key';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({ origin: 'http://172.20.4.112:5000', credentials: true }));
app.use(morgan('dev'));

// app.set('trust proxy', true); // trust first proxy
app.use(
  sessions({
    name: 'silver',
    secret: SECRET_KEY,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 15 * 60 * 1000,
      sameSite: 'lax',
    },
    store: MongoStore.create({
      mongoUrl: MONGO_URI,
      collectionName: 'sessions',
      ttl: 15 * 60, // 15 minutes
      autoRemove: 'disabled', // Let MongoDB handle session expiration
      stringify: false, // Store session data as BSON instead of JSON
      timestamps: true, // Add createdAt and updatedAt timestamps to session documents
    }),
    resave: false,
    saveUninitialized: false,
  }),
);

app.use('/api/health', checkRoutes);

app.use('/api/user', userRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/offer', offerRoutes);

app.use('/uploads', express.static('uploads'));

app.use(errorHandler);

export default app;
