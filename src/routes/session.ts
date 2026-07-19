import express, { Request, Response } from "express";
import authenticateToken from "../middlewares/auth";
import { getSession, removeSession, setSession } from "../controllers";

const router = express.Router();

//set session
router.post("/set", authenticateToken, setSession);
router.get("/get", authenticateToken, getSession);
router.get("/:sessionId/remove", authenticateToken, removeSession);

export default router;
