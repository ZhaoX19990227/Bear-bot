import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AIButton from "../components/ai/AIButton";
import PawPrints from "../components/common/PawPrints";
import UserInfo from '../components/chat/UserInfo';
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [userInfo, setUserInfo] = useState(
    JSON.parse(localStorage.getItem("user"))
  );
  const [avatarPreview, setAvatarPreview] = useState(userInfo.avatar);

  const handleLogout = () => {
    setShowConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("头像文件不能超过5MB");
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
      formData.append("nickname", userInfo.nickname);
      if (userInfo.newAvatar) {
        formData.append("avatar", userInfo.newAvatar);
      }

      const response = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUserInfo(data.user);
        setShowModal(false);
      }
    } catch (error) {
      console.error("更新个人信息失败:", error);
    }
  };

  return (
    <div className="home-container">
      <div className="header">
        <div className="user-info">
          <span className="user-nickname">{userInfo.nickname}</span>
          <div
            className="avatar-container"
            onClick={() => setShowModal(true)}
          >
            <img src={userInfo.avatar} alt="avatar" className="user-avatar" />
          </div>
        </div>
      </div>
      <h1>Hello World</h1>
      <AIButton />
      <PawPrints />

      {/* 个人信息弹窗 */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <UserInfo user={userInfo} />
          </div>
        </div>
      )}

      {/* 退出确认弹窗 */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>确认退出</h3>
            <p>确定要退出登录吗？</p>
            <div className="modal-buttons">
              <button onClick={confirmLogout}>确定</button>
              <button onClick={() => setShowConfirm(false)}>取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
