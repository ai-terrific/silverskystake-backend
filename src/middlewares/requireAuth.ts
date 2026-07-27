import { NextFunction, Request, Response } from 'express';

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.email)
    return res.status(401).json({ error: 'Unauthorized' });
  next();
};

export default requireAuth;
