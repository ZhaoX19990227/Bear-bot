import React, { useState } from 'react';
import './UserInfo.css';

const UserInfo = ({ user }) => {
  const [activeTab, setActiveTab] = useState('info'); // 默认选中个人信息
  const [userInfo, setUserInfo] = useState(user);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false); // 控制退出登录确认弹窗

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('头像文件不能超过5MB');
        return;
      }
      setAvatarPreview(URL.createObjectURL(file));
      setUserInfo({ ...userInfo, newAvatar: file });
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('nickname', userInfo.nickname);
      if (userInfo.newAvatar) {
        formData.append('avatar', userInfo.newAvatar);
      }

      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUserInfo(data.user);
      }
    } catch (error) {
      console.error('更新个人信息失败:', error);
    }
  };

  const handleLogout = () => {
    setShowConfirmLogout(true); // 显示确认弹窗
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; // 直接跳转到登录页面
  };

  return (
    <div className="user-info-modal">
      <div className="tabs">
        <button onClick={() => setActiveTab('info')} className={activeTab === 'info' ? 'active' : ''}>个人信息🐻</button>
        <button onClick={() => setActiveTab('support')} className={activeTab === 'support' ? 'active' : ''}>联系/支持作者🐼</button>
        <button onClick={() => setActiveTab('settings')} className={activeTab === 'settings' ? 'active' : ''}>设置🐻‍❄️</button>
      </div>

      {activeTab === 'info' && (
        <div className="tab-content">
          <h3>个人信息</h3>
          <div className="avatar-upload">
            <img src={avatarPreview} alt="avatar" className="preview-avatar" />
            <label htmlFor="avatar-input" className="upload-label">更换头像</label>
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
          </div>
          <div className="form-group">
            <label>昵称</label>
            <input
              type="text"
              value={userInfo.nickname}
              onChange={(e) => setUserInfo({ ...userInfo, nickname: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>邮箱</label>
            <input type="email" value={userInfo.email} disabled />
          </div>
          <button className="save-button" onClick={handleUpdateProfile}>保存</button>
        </div>
      )}

      {activeTab === 'support' && (
        <div className="tab-content">
          <h3>联系/支持作者</h3>
          <div className="support-images">
            <div className="support-item">
              <img src="/images/friend.jpg" alt="Friend" style={{ width: '100px', margin: '10px' }} />
              <p>加我好友</p>
            </div>
            <div className="support-item">
              <img src="/images/pay.jpg" alt="Pay" style={{ width: '100px', margin: '10px' }} />
              <p>请我喝咖啡</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="tab-content">
          <h3>设置</h3>
          <button className="logout-button" onClick={handleLogout}>退出登录</button>
        </div>
      )}

      {/* 退出登录确认弹窗 */}
      {showConfirmLogout && (
        <div className="modal-overlay" onClick={() => setShowConfirmLogout(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>确认退出</h3>
            <p>确定要退出登录吗？</p>
            <div className="modal-buttons">
              <button onClick={confirmLogout}>确定</button>
              <button onClick={() => setShowConfirmLogout(false)}>取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInfo;