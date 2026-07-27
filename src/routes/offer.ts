import express from 'express';
import { getOffer, submitOffer } from '../controllers';
import requireAuth from '../middlewares/requireAuth';

const router = express.Router();

//register user
router.post('/', requireAuth, submitOffer);

//get profile
router.post('/get', requireAuth, getOffer);

export default router;
