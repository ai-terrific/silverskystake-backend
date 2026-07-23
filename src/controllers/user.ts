import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { generateSecret, generateURI, verify } from 'otplib';
import qrcode from 'qrcode';
import User from '../models/User';
import { JWT_SECRET } from '../config/key';

//register user
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    if (password !== confirmPassword)
      return res.status(400).json({ message: 'Password not match' });

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const wordsInName = username.split(' ');
    let firstName = wordsInName[0];
    let lastName = '';
    if (wordsInName.length) lastName = wordsInName[wordsInName.length - 1];

    const user = new User({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
    });
    const newUser = await user.save();
    res
      .status(201)
      .json({ message: 'User registered successfully', user: newUser });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

//login user by email or password
export const loginUser = async (req: Request, res: Response) => {
  const user = await User.findOne({
    $or: [{ email: req.body.email }, { username: req.body.email }],
  });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const isMatch = await bcrypt.compare(req.body.password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  if (user.twoFARequired) return res.json({ twoFARequired: true });
  const token = jwt.sign({ _id: user._id }, JWT_SECRET);

  res.json({
    message: 'Login successfully',
    token,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      twoFARequired: user.twoFARequired,
    },
  });
};

//get profile
export const getProfile = async (req: Request, res: Response) => {
  const user = await User.findById(req.user._id, '-password');
  if (!user) return res.status(404).json({ message: 'User not found' });

  res.json(user);
};

//update profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, {
      $set: {
        ...req.body,
        avatar: req.file?.filename,
      },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User information updated' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

//verify profile
export const verifyProfile = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, username } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, {
      $set: {
        ...req.body,
      },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User information updated' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

//ignore user
export const ignoreUser = async (req: Request, res: Response) => {
  try {
    const { ignoredUser } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.ignoredUsers.push({ user: ignoredUser });

    await user.save();

    res.json({ message: 'User ignored' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

//get ignored users
export const getIgnoreUsers = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'ignoredUsers.user',
      'username',
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.ignoredUsers);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

//remove ignored user
export const removeIgnoredUser = async (req: Request, res: Response) => {
  try {
    const { ignoredUser } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.ignoredUsers = [
      ...user.ignoredUsers.filter(
        (item) => item.user.toString() !== ignoredUser,
      ),
    ];
    await user.save();
    res.json({ message: 'User accepted' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

//confirm profile
export const confirmDetails = async (req: Request, res: Response) => {
  try {
    let user = await User.findById(req.user._id);

    user = { ...user, ...req.body };

    res
      .status(201)
      .json({ message: 'User registered successfully', user: user });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

//upload identification
export const uploadIdentification = async (req: Request, res: Response) => {
  try {
    const files = req.files as {
      front?: Express.Multer.File[];
      back?: Express.Multer.File[];
    };
    const user = await User.findByIdAndUpdate(req.user._id, {
      $set: {
        identification: {
          front: files.front?.[0].filename,
          back: files.back?.[0].filename,
        },
      },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User information updated' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

//get identifications
export const getIdentification = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user._id, 'identification');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.identification);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

//upload proof of address
export const uploadAddress = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, {
      $set: {
        ...req.body,
        proofAddress: req.file?.filename,
      },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User information updated' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

//get proof of address
export const getProofOfAddress = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user._id, 'proofAddress');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

//upload source of fund
export const uploadFundSource = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, {
      $set: {
        ...req.body,
        fund: req.file?.filename,
      },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User information updated' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

//get source of fund
export const getFundSource = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user._id, 'fund');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

//2fa authentication
export const generateAuthentication = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { enable } = req.body;
    if (enable) {
      const secret = generateSecret();
      const otpauthUrl = generateURI({
        issuer: user.username,
        label: user.email,
        secret,
      });

      const qrCodeImageUrl = await qrcode.toDataURL(otpauthUrl);
      user.secret = secret;
      await user.save();
      res.json({ secret, qrCode: qrCodeImageUrl });
    } else {
      user.twoFARequired = false;
      user.secret = '';
      await user.save();
      res.json({
        message: 'Two factor authentication disabled',
        secret: '',
        qrCode: '',
      });
    }
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

//2fa verification
export const verify2FAAuthentication = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { code } = req.body;

    const isValid = await verify({ secret: user.secret, token: code });

    if (isValid.valid) {
      user.twoFARequired = true;
      await user.save();
      return res.json({ isValid: true, message: 'Verified Successfully' });
    } else
      return res
        .status(400)
        .json({ isValid: false, message: 'Verified failed' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

//2fa login-validation
export const validation2FA = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({
      $or: [{ email: req.body.email }, { username: req.body.email }],
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.twoFARequired) {
      return res
        .status(400)
        .json({ error: '2FA is not enabled for this account' });
    }

    const { code } = req.body;

    const isValid = await verify({ secret: user.secret, token: code });

    if (isValid.valid) {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET);

      res.json({
        message: 'Login successfully',
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          twoFARequired: user.twoFARequired,
          secret: user.secret,
        },
      });
    } else
      return res
        .status(400)
        .json({ isValid: false, message: 'Invalid verification code' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
