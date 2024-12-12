import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { emailUtils } from '../utils/email.js';
import { verificationCodeUtils } from '../config/redis.js';

const JWT_SECRET = process.env.JWT_SECRET || 'bear';

// 发送验证码
export const sendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    
    // 检查邮箱是否已注册
    const [existingUser] = await pool.query(
      'SELECT id FROM users WHERE email = ?', 
      [email]
    );
    
    if (existingUser.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: '该邮箱已被注册' 
      });
    }
    
    // 发送验证码
    await emailUtils.sendVerificationCode(email);
    
    res.json({ 
      success: true, 
      message: '验证码已发送，请查收邮件' 
    });
  } catch (error) {
    console.error('发送验证码失败:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// 验证验证码
export const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    // 验证验证码
    const isValid = await verificationCodeUtils.verifyCode(email, code);
    
    if (isValid) {
      // 验证成功后删除验证码
      await verificationCodeUtils.deleteVerificationCode(email);
      
      res.json({ 
        success: true, 
        message: '验证码正确' 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: '验证码错误或已过期' 
      });
    }
  } catch (error) {
    console.error('验证码验证失败:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// 注册
export const register = async (req, res) => {
  try {
    const { email, password, nickname, code } = req.body;
    
    // 验证验证码
    const isCodeValid = await verificationCodeUtils.verifyCode(email, code);
    if (!isCodeValid) {
      return res.status(400).json({ success: false, message: '验证码错误或已过期' });
    }

    // 检查邮箱是否已存在
    const [existingUser] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ success: false, message: '该邮箱已被注册' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 获取IP地址和地理位置
    const ip = req.ip;
    const latitude = req.body.latitude || null;
    const longitude = req.body.longitude || null;

    const avatarUrl = `${process.env.UPLOAD_URL}/avatars/${req.file.filename}`;

    // 插入用户数据
    await pool.query(
      'INSERT INTO users (email, password, nickname, ip_address, latitude, longitude, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, nickname, ip, latitude, longitude, avatarUrl]
    );

    res.json({ success: true, message: '注册成功' });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ success: false, message: '注册失败' });
  }
};

// 登录
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 查找用户
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: '用户不存在' });
    }

    const user = users[0];
    
    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: '密码错误' });
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: '登录成功',
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ success: false, message: '登录失败' });
  }
};

// 找回密码
export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    // 验证验证码
    const isCodeValid = await verificationCodeUtils.verifyCode(email, code);
    if (!isCodeValid) {
      return res.status(400).json({ success: false, message: '验证码错误或已过期' });
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await pool.query(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, email]
    );

    // 删除验证码
    await verificationCodeUtils.deleteVerificationCode(email);

    res.json({ success: true, message: '密码重置成功' });
  } catch (error) {
    console.error('密码重置失败:', error);
    res.status(500).json({ success: false, message: '密码重置失败' });
  }
};

// 获取用户信息
export const getUserInfo = async (req, res) => {
  try {
    const userId = req.user.userId; // 从JWT中获取

    const [users] = await pool.query(
      'SELECT id, email, nickname, avatar FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ success: false, message: '获取用户信息失败' });
  }
}; 