import express from 'express';
import { getOffer, submitOffer } from '../controllers';
import authenticateToken from '../middlewares/auth';

const router = express.Router();

//register user
router.post('/', authenticateToken, submitOffer);

//get profile
router.post('/get', authenticateToken, getOffer);

export default router;
