import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { JWT_SECRET } from "../config";
import Offer from "../models/Offer";

//submit offer
export const submitOffer = async (req: Request, res: Response) => {
  try {
    const { expire, code } = req.body;
    const newOffer = new Offer({ expire, code, user: req.user._id });
    newOffer.user = req.user._id;
    await newOffer.save();
    res.status(201).json({ message: "Offer set successfully" });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

//get offers
export const getOffer = async (req: Request, res: Response) => {
  try {
    const offers = await Offer.find({
      user: req.user._id,
      expire: req.body.expire,
    }).sort("-createdAt");
    res.status(201).json(offers[0]);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
