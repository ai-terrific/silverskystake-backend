import express, { Request, Response } from 'express';
import authenticateToken from '../middlewares/auth';
import { getSession, removeSession, setSession } from '../controllers';

const router = express.Router();

//get session
router.get('/get', authenticateToken, getSession);

//set session
router.post('/set', authenticateToken, setSession);

//remove session
router.delete('/:sessionId/remove', authenticateToken, removeSession);

export default router;
