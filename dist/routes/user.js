"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = __importDefault(require("../middlewares/auth"));
const router = express_1.default.Router();
//register user
router.post("/register", async (req, res) => {
    try {
        const hashedPassword = await bcryptjs_1.default.hash(req.body.password, 10);
        const user = new User_1.default({
            ...req.body,
            password: hashedPassword,
        });
        const newUser = await user.save();
        res
            .status(201)
            .json({ message: "User registered successfully", user: newUser });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
//login user
router.post("/login", async (req, res) => {
    const user = await User_1.default.findOne({ email: req.body.email });
    if (!user)
        return res.status(404).json({ message: "User not found" });
    const isMatch = await bcryptjs_1.default.compare(req.body.password, user.password);
    if (!isMatch)
        return res.status(400).json({ message: "Invalid credentials" });
    const token = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.JWT_SECRET);
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
router.get("/profile", auth_1.default, async (req, res) => {
    const user = await User_1.default.findById(req.user._id);
    res.status(200).json(user);
});
//follow user
router.get("/:id/follow", auth_1.default, async (req, res) => {
    try {
        const userToFollow = await User_1.default.findById(req.params.id);
        if (!userToFollow)
            return res.status(404).json({ message: "User not found" });
        const currentUser = await User_1.default.findById(req.user._id);
        if (!currentUser)
            return res.status(404).json({ message: "User not found" });
        if (!currentUser.following.includes(userToFollow._id)) {
            currentUser.following.push(userToFollow._id);
            userToFollow.followers.push(currentUser._id);
            await currentUser.save();
            await userToFollow.save();
            res
                .status(201)
                .json({ status: "user followed successfully", user: currentUser });
        }
        else
            res.status(201).json({ status: "already followed" });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
//unfollow user
router.get("/:id/unfollow", auth_1.default, async (req, res) => {
    try {
        const userToUnfollow = await User_1.default.findById(req.params.id);
        if (!userToUnfollow)
            return res.status(404).json({ message: "User not found" });
        const currentUser = await User_1.default.findById(req.user._id);
        if (!currentUser)
            return res.status(404).json({ message: "User not found" });
        if (currentUser.following.includes(userToUnfollow._id)) {
            currentUser.following = currentUser.following.filter((id) => id.toString() !== userToUnfollow._id.toString());
            userToUnfollow.followers = userToUnfollow.followers.filter((id) => id.toString() !== currentUser._id.toString());
            await currentUser.save();
            await userToUnfollow.save();
            res
                .status(201)
                .json({ status: "user unfollowed successfully", user: currentUser });
        }
        else
            res.status(400).json({ status: "you are not following this user" });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
//fetch all the current user
router.get("/explore", auth_1.default, async (req, res) => {
    try {
        const users = await User_1.default.find({ _id: { $ne: req.user._id } }).select("email username following followers _id");
        res.status(200).json(users);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
//get user by ID
router.get("/:id", auth_1.default, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id).select("-password");
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.status(200).json({ user });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.default = router;
