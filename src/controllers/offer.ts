import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { JWT_SECRET } from '../config/key';
import Offer from '../models/Offer';

//submit offer
export const submitOffer = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ email: req.session.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { expire, code } = req.body;
    const newOffer = new Offer({ expire, code, user: user._id });
    await newOffer.save();
    res.status(201).json({ message: 'Offer set successfully' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

//get offers
export const getOffer = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ email: req.session.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const offers = await Offer.find({
      user: user._id as any,
      expire: req.body.expire,
    }).sort('-createdAt');
    res.status(201).json(offers[0]);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
