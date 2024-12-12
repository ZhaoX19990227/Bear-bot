import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import { api } from '../../utils/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    nickname: '',
    password: '',
    confirmPassword: '',
    verificationCode: ''
  });
  const [error, setError] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const sendVerificationCode = async () => {
    try {
      const response = await api.sendRequest('/auth/send-code', {
        method: 'POST',
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();
      if (data.success) {
        setIsCodeSent(true);
        alert('验证码已发送到您的邮箱');
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('发送验证码失败:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    try {
      const response = await api.sendRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email,
          nickname: formData.nickname,
          password: formData.password,
          code: formData.verificationCode
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('注册成功！');
        navigate('/login');
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('注册失败，请稍后重试');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>注册</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="邮箱"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              name="nickname"
              placeholder="昵称"
              value={formData.nickname}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="密码"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              name="confirmPassword"
              placeholder="确认密码"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group verification-code">
            <input
              type="text"
              name="verificationCode"
              placeholder="验证码"
              value={formData.verificationCode}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={sendVerificationCode}
              disabled={isCodeSent}
              className="send-code-button"
            >
              {isCodeSent ? '已发送' : '发送验证码'}
            </button>
          </div>
          <button type="submit" className="auth-button">注册</button>
        </form>
        <div className="auth-links">
          <span onClick={() => navigate('/login')}>已有账号？立即登录</span>
        </div>
      </div>
    </div>
  );
};

export default Register;
