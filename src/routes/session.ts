import express, { Request, Response } from 'express';
import { getSession, removeSession } from '../controllers';
import requireAuth from '../middlewares/requireAuth';

const router = express.Router();

//get session
router.get('/', requireAuth, getSession);

//remove session
router.delete('/:sessionId', requireAuth, removeSession);

export default router;
