import Redis from 'ioredis';

const redis = new Redis({
  host: 'localhost',
  port: 6379,
  // password: 'your_redis_password', // 如果有密码，取消注释此行
});

// 验证码相关的常量
export const VERIFICATION_CODE_PREFIX = 'email_verify_';
export const VERIFICATION_CODE_EXPIRE = 300; // 5分钟过期

// 验证码操作的工具函数
export const verificationCodeUtils = {
  // 保存验证码
  async saveVerificationCode(email, code) {
    const key = VERIFICATION_CODE_PREFIX + email;
    await redis.set(key, code, 'EX', VERIFICATION_CODE_EXPIRE);
  },

  // 获取验证码
  async getVerificationCode(email) {
    const key = VERIFICATION_CODE_PREFIX + email;
    return await redis.get(key);
  },

  // 删除验证码
  async deleteVerificationCode(email) {
    const key = VERIFICATION_CODE_PREFIX + email;
    await redis.del(key);
  },

  // 验证验证码
  async verifyCode(email, code) {
    const savedCode = await this.getVerificationCode(email);
    return savedCode === code;
  }
};

export default redis; 