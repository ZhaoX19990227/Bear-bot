import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取 __dirname 的 ES 模块替代方案
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 配置 multer 用于处理文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 限制文件大小为 50MB
  }
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: '服务器内部错误' 
  });
});

const isDev = process.env.NODE_ENV === 'development';
const uploadPath = isDev 
  ? path.join(__dirname, 'public/uploads')  // 本地开发路径
  : '/usr/bear-bot/backend/public/uploads'; // 服务器路径

// 添加静态文件服务
app.use('/uploads', express.static(uploadPath));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 