import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "no token found" });
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET || "harrysocialdev");
  req.user = decoded;
  return next();
};

export default authenticateToken;
