import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [pawPrints, setPawPrints] = useState([]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/chat');
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('登录失败，请稍后重试');
    }
  };

  const handleClick = (e) => {
    const newPaw = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY
    };
    setPawPrints(prev => [...prev, newPaw]);
    
    setTimeout(() => {
      setPawPrints(prev => prev.filter(paw => paw.id !== newPaw.id));
    }, 1000);
  };

  return (
    <div className="auth-container" onClick={handleClick}>
      <div className="auth-box">
        <h2>登录</h2>
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
              type="password"
              name="password"
              placeholder="密码"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="auth-button">登录</button>
        </form>
        <div className="auth-links">
          <span onClick={() => navigate('/register')}>还没有账号？立即注册</span>
          <span onClick={() => navigate('/forgot-password')}>忘记密码？</span>
        </div>
      </div>
      {pawPrints.map(paw => (
        <div
          key={paw.id}
          className="paw-print"
          style={{
            left: paw.x - 10,
            top: paw.y - 10
          }}
        >
          🐾
        </div>
      ))}
    </div>
  );
};

export default Login;
