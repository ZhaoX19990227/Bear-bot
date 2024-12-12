import React, { useState } from 'react';
import './AIButton.css';

const AIButton = () => {
  const [isAnimating, setIsAnimating] = useState(true);

  const handleClick = () => {
    // 打开新窗口
    const chatWindow = window.open('/chat', '_blank', 'width=800,height=600');
    chatWindow.focus();
  };

  return (
    <div 
      className={`ai-button ${isAnimating ? 'pulse' : ''}`}
      onClick={handleClick}
      onMouseEnter={() => setIsAnimating(false)}
      onMouseLeave={() => setIsAnimating(true)}
    >
      <img 
        src="https://attach-sit.oss-cn-shanghai.aliyuncs.com/default/28a14b07da0d4e7684758a48649b5ad9.png?1=1" 
        alt="AI Assistant" 
      />
      <div className="tooltip">点击开始聊天</div>
    </div>
  );
};

export default AIButton;