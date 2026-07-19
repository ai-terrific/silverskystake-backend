import express, { Request, Response } from "express";
import multer from "multer";
import {
  confirmDetails,
  getIdentification,
  getIgnoreUsers,
  getProfile,
  ignoreUser,
  loginUser,
  registerUser,
  removeIgnoredUser,
  updateProfile,
  uploadIdentification,
  verifyProfile,
} from "../controllers";
import authenticateToken from "../middlewares/auth";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}${ext}`;

    cb(null, filename);
  },
});

const upload = multer({ storage });

router.get("/", (req: Request, res: Response) => {
  res.json("Server works");
});

//register user
router.post("/register", registerUser);

//login user
router.post("/login", loginUser);

//get profile
router.get("/getProfile", authenticateToken, getProfile);

//update profile
router.post(
  "/updateProfile",
  authenticateToken,
  upload.single("avatar"),
  updateProfile,
);

//update profile
router.post("/verifyProfile", authenticateToken, verifyProfile);

//ignore profile
router.post("/ignoreUser", authenticateToken, ignoreUser);

//get ignored users
router.get("/ignoreUser", authenticateToken, getIgnoreUsers);

//remove ignored users
router.get(
  "/ignoreUser/:ignoredUser/remove",
  authenticateToken,
  removeIgnoredUser,
);

//confirm details
router.post("/confirm", authenticateToken, confirmDetails);

//update profile
router.post(
  "/identification/upload",
  authenticateToken,
  upload.fields([
    { name: "front", maxCount: 1 },
    { name: "back", maxCount: 1 },
  ]),
  uploadIdentification,
);

//get identifications
router.get("/identification", authenticateToken, getIdentification);

export default router;
