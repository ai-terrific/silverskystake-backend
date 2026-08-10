import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { generateSecret, generateURI, verify } from 'otplib';
import qrcode from 'qrcode';
import { BrevoClient } from '@getbrevo/brevo';
import User from '../models/User';
import { BREVO, JWT_SECRET, FRONTEND_URI, SECRET_KEY } from '../config/key';

const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

declare module 'express-session' {
  interface SessionData {
    email: string;
    region: string;
    city: string;
    browser: string;
    ip: string;
  }
}

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
  try {
    const user = await User.findOne({
      $or: [
        { email: req.body.emailOrUsername },
        { username: req.body.emailOrUsername },
      ],
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    if (user.twoFARequired) return res.json({ twoFARequired: true });
    const token = jwt.sign({ _id: user._id }, JWT_SECRET);

    let ip = (req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress) as string;

    ip = ip.split('::ffff:')[1] || ip;

    const geo = geoip.lookup(ip);

    // if (!geo) {
    //   return res
    //     .status(400)
    //     .json({ error: 'Location could not be determined.' });
    // }

    const ua = req.headers['user-agent'];

    // Parse the string using ua-parser-js
    const parser = new UAParser(ua);
    const browser = parser.getBrowser();

    req.session.regenerate((err) => {
      req.session.email = user.email;
      req.session.region = geo?.region || 'Unknown';
      req.session.city = geo?.city || 'Unknown';
      req.session.browser = browser.name || 'Unknown';
      req.session.ip = ip as string;
      req.session.save((error) => {
        return res.json({
          message: 'Login successfully',
          token,
          user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            twoFARequired: user.twoFARequired,
          },
        });
      });
    });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

//get profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ email: req.session.email }, '-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    else return res.json(user);
  } catch (err: any) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
};

//update profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.session.email },
      {
        $set: {
          ...req.body,
          avatar: req.file?.filename,
        },
      },
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User information updated' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

//verify profile
export const verifyProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.session.email },
      {
        $set: {
          ...req.body,
        },
      },
    );
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
    const user = await User.findOne({ email: req.session.email });
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
    const user = await User.findOne({ email: req.session.email }).populate(
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
    const user = await User.findOne({ email: req.session.email });
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
    let user = await User.findOne({ email: req.session.email });

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
    const user = await User.findOneAndUpdate(
      { email: req.session.email },
      {
        $set: {
          identification: {
            front: files.front?.[0].filename,
            back: files.back?.[0].filename,
          },
        },
      },
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User information updated' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

//get identifications
export const getIdentification = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne(
      { email: req.session.email },
      'identification',
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.identification);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

//upload proof of address
export const uploadAddress = async (req: Request, res: Response) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.session.email },
      {
        $set: {
          ...req.body,
          proofAddress: req.file?.filename,
        },
      },
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User information updated' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

//get proof of address
export const getProofOfAddress = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne(
      { email: req.session.email },
      'proofAddress',
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

//upload source of fund
export const uploadFundSource = async (req: Request, res: Response) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.session.email },
      {
        $set: {
          ...req.body,
          fund: req.file?.filename,
        },
      },
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User information updated' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

//get source of fund
export const getFundSource = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ email: req.session.email }, 'fund');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

//2fa authentication
export const generateAuthentication = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ email: req.session.email });
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

//get 2fa authentication
export const getAuthentication = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ email: req.session.email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otpauthUrl = generateURI({
      issuer: user.username,
      label: user.email,
      secret: user.secret as string,
    });

    const qrCodeImageUrl = await qrcode.toDataURL(otpauthUrl);
    res.json({ secret: user.secret, qrCode: qrCodeImageUrl });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

//2fa verification
export const verify2FAAuthentication = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ email: req.session.email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { code } = req.body;

    const isValid = await verify({ secret: user.secret, token: code });
    console.log({ secret: user.secret, token: code });
    console.log(isValid);

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

    console.log({ secret: user.secret, token: code });
    console.log(isValid);

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

//forget password link
export const forgetPassword = async (req: Request, res: Response) => {
  try {
    let { email } = req.body;
    const user = await User.findOne({ email: email });
    if (!user)
      return res.status(200).json({
        message:
          'You will receive an email with instructions to reset your password if an account exists for this email address.',
      });

    const token = jwt.sign({ email: user.email }, JWT_SECRET, {
      expiresIn: '15min',
    });

    const brevo = new BrevoClient({ apiKey: BREVO.key });

    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject: 'Hello from Brevo!',
      htmlContent: `<html><body><a href=${FRONTEND_URI}/${token}/reset-password target='_blank'>Click here to get a new password rest link.</a><p>If you don't use this link within 30 minutes, it will expire.</p></body></html>`,
      sender: { name: BREVO.host.name, email: BREVO.host.email },
      to: [{ email: email }],
    });

    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

//reset password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password, confirmPassword } = req.body;
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
    console.log(decoded);
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (password !== confirmPassword)
      return res.status(400).json({ message: 'Password not match' });

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    user.password = hashedPassword;

    await user.save();
    res.status(201).json({ message: 'Password changed successfully' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

//get ip and geo location
export const getIPAndGeoLocation = async (req: Request, res: Response) => {
  const ip = req.ip;
  const geo = geoip.lookup(ip as string);

  res.json({ ip, geo });
};
