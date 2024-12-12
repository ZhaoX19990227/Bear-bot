import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
import {
  sendMessage,
  handleFileMessage,
  getChatHistory
} from '../controllers/chatController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// 所有路由都需要认证
router.use(authenticateToken);

// 发送消息
router.post('/send', sendMessage);

// 上传文件并处理
router.post('/file', upload.single('file'), handleFileMessage);

// 获取聊天历史
router.get('/history', getChatHistory);

export default router; 