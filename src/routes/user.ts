import express from 'express';
import multer from 'multer';
import {
  confirmDetails,
  generateAuthentication,
  getFundSource,
  getIdentification,
  getIgnoreUsers,
  getProfile,
  getProofOfAddress,
  ignoreUser,
  loginUser,
  registerUser,
  removeIgnoredUser,
  updateProfile,
  uploadAddress,
  uploadFundSource,
  uploadIdentification,
  validation2FA,
  verify2FAAuthentication,
  verifyProfile,
} from '../controllers';
import authenticateToken from '../middlewares/auth';
import path from 'path';

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
router.get('/get-profile', authenticateToken, getProfile);

//get ignored users
router.get('/ignore-user', authenticateToken, getIgnoreUsers);

//get identifications
router.get('/identification', authenticateToken, getIdentification);

//get proof of address
router.get('/address', authenticateToken, getProofOfAddress);

//get source of fund
router.get('/fund', authenticateToken, getFundSource);

//register user
router.post('/register', registerUser);

//login user
router.post('/login', loginUser);

//update profile
router.post(
  '/update-profile',
  authenticateToken,
  upload.single('avatar'),
  updateProfile,
);

//update profile
router.post('/verify-profile', authenticateToken, verifyProfile);

//ignore profile
router.post('/ignore-user', authenticateToken, ignoreUser);

//confirm details
router.post('/confirm', authenticateToken, confirmDetails);

//update profile
router.post(
  '/identification',
  authenticateToken,
  upload.fields([
    { name: 'front', maxCount: 1 },
    { name: 'back', maxCount: 1 },
  ]),
  uploadIdentification,
);

//verify proof of address
router.post(
  '/address',
  authenticateToken,
  upload.single('proofAddress'),
  uploadAddress,
);

//verify source of fund
router.post(
  '/fund',
  authenticateToken,
  upload.single('fundSource'),
  uploadFundSource,
);

//remove ignored users
router.delete(
  '/ignore-user/:ignoredUser/remove',
  authenticateToken,
  removeIgnoredUser,
);

//2fa generation secret and qrcode
router.post('/2fa/setup', authenticateToken, generateAuthentication);

//2fa verification
router.post('/2fa/verify', authenticateToken, verify2FAAuthentication);

//login validation by 2FA
router.post('/2fa/validation', validation2FA);

export default router;
