import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';

import checkRoutes from './routes/healthcheck';
import userRoutes from './routes/user';
import sessionRoutes from './routes/session';
import offerRoutes from './routes/offer';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('dev'));

app.use('/api/health', checkRoutes);

app.use('/api/user', userRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/offer', offerRoutes);

app.use('/uploads', express.static('uploads'));

app.use(errorHandler);

export default app;
