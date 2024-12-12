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
    verificationCode: '',
    avatar: ''
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('头像文件不能超过5MB');
        return;
      }
      setFormData({ ...formData, avatar: file });
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.avatar) {
      setError('请上传头像');
      return false;
    }

    if (!formData.email) {
      setError('请输入邮箱');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('请输入有效的邮箱地址');
      return false;
    }

    if (!formData.nickname) {
      setError('请输入昵称');
      return false;
    }

    if (!formData.password) {
      setError('请输入密码');
      return false;
    }

    if (formData.password.length < 6) {
      setError('密码长度不能少于6位');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return false;
    }

    if (!formData.verificationCode) {
      setError('请输入验证码');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 清除之前的错误信息
    setError('');

    // 表单验证
    if (!validateForm()) {
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('email', formData.email);
      formDataToSend.append('nickname', formData.nickname);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('code', formData.verificationCode);
      formDataToSend.append('avatar', formData.avatar);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: formDataToSend
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

  const sendVerificationCode = async () => {
    // 清除之前的错误信息
    setError('');

    // 验证邮箱
    if (!formData.email) {
      setError('请输入邮箱');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('请输入有效的邮箱地址');
      return;
    }

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
      setError('发送验证码失败，请稍后重试');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>注册</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="avatar-upload">
            <div className="avatar-wrapper">
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="头像预览"
                  className="avatar-preview"
                />
              ) : (
                <div className="avatar-placeholder">
                  <span>🐻 📷 🐻</span>
                  <span>上传头像</span>
                </div>
              )}
              <div className="avatar-overlay">
                <label htmlFor="avatar-input" className="upload-label">
                  <span>点击上传</span>
                </label>
              </div>
            </div>
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              required
              style={{ display: 'none' }}
            />
          </div>
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
              disabled={isCodeSent && !error}
              className="send-code-button"
            >
              {isCodeSent && !error ? '已发送' : '发送验证码'}
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
