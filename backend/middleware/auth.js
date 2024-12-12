import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bear';

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: '未提供认证令牌' 
      });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(403).json({ 
            success: false, 
            message: '登录已过期，请重新登录' 
          });
        }
        return res.status(403).json({ 
          success: false, 
          message: '无效的认证令牌' 
        });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Token验证错误:', error);
    return res.status(500).json({ 
      success: false, 
      message: '认证过程发生错误' 
    });
  }
}; 