import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { JWT_SECRET } from '../config/key';
import Session from '../models/Session';

//set session
export const setSession = async (req: Request, res: Response) => {
  try {
    const newSession = new Session(req.body);
    newSession.user = req.user._id;
    await newSession.save();
    res.status(201).json({ message: 'Session set successfully' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

//get sessions
export const getSession = async (req: Request, res: Response) => {
  try {
    const sessions = await Session.find({ user: req.user._id });
    res.status(201).json(sessions);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

//remove session
export const removeSession = async (req: Request, res: Response) => {
  try {
    await Session.findByIdAndDelete(req.params.sessionId);
    res.status(201).json({ message: 'Session set successfully' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
