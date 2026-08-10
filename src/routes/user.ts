import express from 'express';
import multer from 'multer';
import {
  confirmDetails,
  forgetPassword,
  generateAuthentication,
  getAuthentication,
  getFundSource,
  getIdentification,
  getIgnoreUsers,
  getIPAndGeoLocation,
  getProfile,
  getProofOfAddress,
  ignoreUser,
  loginUser,
  registerUser,
  removeIgnoredUser,
  resetPassword,
  updateProfile,
  uploadAddress,
  uploadFundSource,
  uploadIdentification,
  validation2FA,
  verify2FAAuthentication,
  verifyProfile,
} from '../controllers';
import path from 'path';
import requireAuth from '../middlewares/requireAuth';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}${ext}`;

    cb(null, filename);
  },
});

const upload = multer({ storage });

//get profile
router.get('/get-profile', requireAuth, getProfile);

//get ignored users
router.get('/ignore-user', requireAuth, getIgnoreUsers);

//get identifications
router.get('/identification', requireAuth, getIdentification);

//get proof of address
router.get('/address', requireAuth, getProofOfAddress);

//get source of fund
router.get('/fund', requireAuth, getFundSource);

//register user
router.post('/register', registerUser);

//login user
router.post('/login', loginUser);

//update profile
router.post(
  '/update-profile',
  requireAuth,
  upload.single('avatar'),
  updateProfile,
);

//update profile
router.post('/verify-profile', requireAuth, verifyProfile);

//ignore profile
router.post('/ignore-user', requireAuth, ignoreUser);

//confirm details
router.post('/confirm', requireAuth, confirmDetails);

//update profile
router.post(
  '/identification',
  requireAuth,
  upload.fields([
    { name: 'front', maxCount: 1 },
    { name: 'back', maxCount: 1 },
  ]),
  uploadIdentification,
);

//verify proof of address
router.post(
  '/address',
  requireAuth,
  upload.single('proofAddress'),
  uploadAddress,
);

//verify source of fund
router.post(
  '/fund',
  requireAuth,
  upload.single('fundSource'),
  uploadFundSource,
);

//remove ignored users
router.delete(
  '/ignore-user/:ignoredUser/remove',
  requireAuth,
  removeIgnoredUser,
);

//2fa generation secret and qrcode
router.post('/2fa/setup', requireAuth, generateAuthentication);

//get 2fa authentication secret and qrcode
router.get('/2fa', requireAuth, getAuthentication);

//2fa verification
router.post('/2fa/verify', requireAuth, verify2FAAuthentication);

//login validation by 2FA
router.post('/2fa/validation', validation2FA);

//forgot password
router.post('/forgot-password', forgetPassword);

//reset passwrod
router.post('/reset-password', resetPassword);

router.get('/get', getIPAndGeoLocation);

export default router;
