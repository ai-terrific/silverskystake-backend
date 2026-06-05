"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Post_1 = __importDefault(require("../models/Post"));
const auth_1 = __importDefault(require("../middlewares/auth"));
const router = express_1.default.Router();
//create post
router.post("/create", auth_1.default, async (req, res) => {
    try {
        const post = new Post_1.default({
            user: req.user._id,
            content: req.body.content,
        });
        const newPost = await post.save();
        res
            .status(201)
            .json({ status: "post created successfully", data: newPost });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
//get posts
router.get("/", auth_1.default, async (req, res) => {
    try {
        const posts = await Post_1.default.find()
            .populate("user", ["username", "email"])
            .populate("likes", "username")
            .populate("comments.user", "username");
        res.status(201).json(posts);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
//like post
router.get("/:postId/like", auth_1.default, async (req, res) => {
    try {
        const post = await Post_1.default.findById(req.params.postId);
        if (!post)
            return res.status(404).json({ message: "post not found" });
        if (!post.likes.includes(req.user._id)) {
            post.likes.push(req.user._id);
            await post.save();
            res.status(200).json({ message: "post likes successfully" });
        }
        else {
            res.status(404).json({ message: "you already liked the post" });
        }
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
//add comment to post
router.post("/:postId/comment", auth_1.default, async (req, res) => {
    try {
        const post = await Post_1.default.findById(req.params.postId);
        if (!post)
            return res.status(404).json({ message: "post not found" });
        const comment = {
            user: req.user._id,
            content: req.body.content,
        };
        post.comments.push(comment);
        await post.save();
        res.status(200).json({ message: "comment added successfully" });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.default = router;
