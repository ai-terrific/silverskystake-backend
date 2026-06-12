import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

import authenticateToken from "../middlewares/auth";
import { JWT_SECRET } from "../config";

const router = express.Router();

//register user
router.post("/register", async (req: Request, res: Response) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      ...req.body,
      password: hashedPassword,
    });
    const newUser = await user.save();
    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

//login user
router.post("/login", async (req: Request, res: Response) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(req.body.password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
  const tokenSecret = JWT_SECRET;

  const token = jwt.sign({ _id: user._id }, tokenSecret);

  res.header("Authorization", "Bearer " + token).json({
    message: "Login successfully",
    token,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      followers: user.followers,
      following: user.following,
    },
  });
});

//get profile
router.get(
  "/profile",
  authenticateToken,
  async (req: Request, res: Response) => {
    const user = await User.findById(req.user._id).populate(
      "followers following",
      ["_id", "username", "email"],
    );
    res.status(200).json({ user });
  },
);

//follow user
router.get(
  "/:id/follow",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      if (req.user._id === req.params.id)
        return res.status(404).json({ message: "Cannot follow yourself" });
      const userToFollow = await User.findById(req.params.id);

      if (!userToFollow)
        return res.status(404).json({ message: "User not found" });

      const currentUser = await User.findById(req.user._id);

      if (!currentUser)
        return res.status(404).json({ message: "User not found" });

      if (!currentUser.following.includes(userToFollow._id)) {
        currentUser.following.push(userToFollow._id);
        userToFollow.followers.push(currentUser._id);
        await currentUser.save();
        await userToFollow.save();
        const users = await User.find().select(
          "email username following followers _id",
        );
        res
          .status(201)
          .json({ message: "user followed successfully", users: users });
      } else res.status(201).json({ message: "already followed" });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },
);

//unfollow user
router.get(
  "/:id/unfollow",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      if (req.user._id === req.params.id)
        return res.status(404).json({ message: "Cannot unfollow yourself" });
      const userToUnfollow = await User.findById(req.params.id);

      if (!userToUnfollow)
        return res.status(404).json({ message: "User not found" });

      const currentUser = await User.findById(req.user._id);

      if (!currentUser)
        return res.status(404).json({ message: "User not found" });

      if (currentUser.following.includes(userToUnfollow._id)) {
        currentUser.following = currentUser.following.filter(
          (id) => id.toString() !== userToUnfollow._id.toString(),
        );

        userToUnfollow.followers = userToUnfollow.followers.filter(
          (id) => id.toString() !== currentUser._id.toString(),
        );
        await currentUser.save();
        await userToUnfollow.save();
        const users = await User.find().select(
          "email username following followers _id",
        );
        res
          .status(201)
          .json({ message: "user unfollowed successfully", users: users });
      } else
        res.status(400).json({ message: "you are not following this user" });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },
);

//fetch all the current user
router.get("/explore", async (req: Request, res: Response) => {
  try {
    const users = await User.find().select(
      "email username following followers _id",
    );
    res.status(200).json(users);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

//get user by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers following", ["_id", "username", "email"]);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
