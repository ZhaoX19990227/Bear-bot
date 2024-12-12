import nodemailer from 'nodemailer';
import { verificationCodeUtils } from '../config/redis.js';
import 'dotenv/config';

// 邮件配置
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,    // smtp.feishu.cn
  port: process.env.SMTP_PORT,    // 465
  secure: true,                   // 使用 SSL
  auth: {
    user: process.env.SMTP_USER,  // 您的飞书邮箱
    pass: process.env.SMTP_PASS   // 您的密码或授权码
  }
});

// 验证邮件配置是否正确
transporter.verify(function(error, success) {
  if (error) {
    console.log('邮件配置错误:', error);
  } else {
    console.log('邮件服务器连接成功!');
  }
});

export const emailUtils = {
  // 生成6位随机验证码
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  // 发送验证码邮件
  async sendVerificationCode(email) {
    const code = this.generateVerificationCode();
    
    const mailOptions = {
      from: `"小肉熊AI助手" <${process.env.SMTP_USER}>`,  // 发件人
      to: email,
      subject: '验证码 - 小肉熊AI助手',
      html: `
        <div style="padding: 20px; background-color: var(--cream); color: var(--dark-brown);">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #8B7355; text-align: center; margin-bottom: 20px;">🐻 您的验证码</h2>
            <p style="font-size: 16px; line-height: 1.5;">亲爱的用户：</p>
            <p style="font-size: 16px; line-height: 1.5;">您的验证码是：</p>
            <div style="text-align: center; padding: 15px; margin: 20px 0; background-color: #FAEBD7; border-radius: 8px;">
              <span style="color: #8B7355; font-size: 24px; font-weight: bold; letter-spacing: 5px;">${code}</span>
            </div>
            <p style="font-size: 14px; color: #666;">验证码有效期为5分钟，请尽快使用。</p>
            <p style="font-size: 14px; color: #666;">如果这不是您的操作，请忽略此邮件。</p>
            <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
              <p>🐾 小肉熊AI助手</p>
            </div>
          </div>
        </div>
      `
    };

    try {
      // 发送邮件
      await transporter.sendMail(mailOptions);
      
      // 保存验证码到Redis
      await verificationCodeUtils.saveVerificationCode(email, code);
      
      return true;
    } catch (error) {
      console.error('发送验证码失败:', error);
      throw new Error('发送验证码失败: ' + error.message);
    }
  }
}; 