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
    return res.sendStatus(401).json({ error: "no token found" });
  }
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET || "harrysocialdev",
    (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    },
  );
};

export default authenticateToken;
