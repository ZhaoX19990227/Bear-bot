import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  register,
  login,
  sendVerificationCode,
  verifyCode,
  resetPassword,
  getUserInfo
} from '../controllers/authController.js';

const router = express.Router();

// 公开路由
router.post('/register', register);
router.post('/login', login);
router.post('/send-code', sendVerificationCode);
router.post('/verify-code', verifyCode);
router.post('/reset-password', resetPassword);

// 需要认证的路由
router.get('/user-info', authenticateToken, getUserInfo);

export default router; 