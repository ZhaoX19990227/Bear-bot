import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  register,
  login,
  sendVerificationCode,
  verifyCode,
  resetPassword,
  getUserInfo,
  uploadAvatar
} from '../controllers/authController.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
// 公开路由
router.post('/register', register);
router.post('/login', login);
router.post('/send-code', sendVerificationCode);
router.post('/verify-code', verifyCode);
router.post('/reset-password', resetPassword);

// 需要认证的路由
router.get('/user-info', authenticateToken, getUserInfo);
router.post('/upload-avatar', upload.single('file'), uploadAvatar);

export default router; 