import express, { Request, Response } from "express";
import Post from "../models/Post";

import authenticateToken from "../middlewares/auth";

const router = express.Router();

//create post
router.post(
  "/create",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const post = new Post({
        user: req.user._id,
        content: req.body.content,
      });

      const newPost = await post.save();
      res
        .status(201)
        .json({ status: "post created successfully", data: newPost });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },
);

//get posts
router.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const posts = await Post.find()
      .populate("user", ["username", "email"])
      .populate("likes", "username")
      .populate("comments.user", "username");
    res.status(201).json(posts);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

//like post
router.get(
  "/:postId/like",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const post = await Post.findById(req.params.postId);
      if (!post) return res.status(404).json({ message: "post not found" });

      if (!post.likes.includes(req.user._id)) {
        post.likes.push(req.user._id);
        await post.save();
        res.status(200).json({ message: "post likes successfully" });
      } else {
        res.status(404).json({ message: "you already liked the post" });
      }
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },
);

//add comment to post
router.post(
  "/:postId/comment",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const post = await Post.findById(req.params.postId);
      if (!post) return res.status(404).json({ message: "post not found" });

      const comment = {
        user: req.user._id,
        content: req.body.content,
      };

      post.comments.push(comment);
      await post.save();
      res.status(200).json({ message: "comment added successfully" });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },
);

export default router;
