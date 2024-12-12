import React, { useState } from 'react';
import './UserInfo.css';

const UserInfo = ({ user, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [userInfo, setUserInfo] = useState(user);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userInfo)
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUserInfo(data.user);
        setShowModal(false);
      }
    } catch (error) {
      console.error('更新个人信息失败:', error);
    }
  };

  return (
    <div className="user-info">
      <div className="user-avatar" onClick={() => setShowDropdown(!showDropdown)}>
        <img src={user.avatar} alt={user.nickname} />
        <span className="user-nickname">{user.nickname}</span>
      </div>

      {showDropdown && (
        <div className="dropdown-menu">
          <div onClick={() => setShowModal(true)}>个人信息</div>
          <div onClick={onLogout}>退出登录</div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>个人信息</h3>
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label>头像</label>
                <img src={userInfo.avatar} alt="avatar" className="preview-avatar" />
              </div>
              <div className="form-group">
                <label>昵称</label>
                <input
                  type="text"
                  value={userInfo.nickname}
                  onChange={(e) => setUserInfo({...userInfo, nickname: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>邮箱</label>
                <input type="email" value={userInfo.email} disabled />
              </div>
              <div className="modal-buttons">
                <button type="submit">保存</button>
                <button type="button" onClick={() => setShowModal(false)}>取消</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInfo; 