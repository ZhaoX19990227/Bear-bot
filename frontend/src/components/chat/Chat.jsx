import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import UserInfo from './UserInfo';
import { RiSendPlaneFill } from 'react-icons/ri';
import { BsFileEarmarkArrowUp } from 'react-icons/bs';
import './Chat.css';

const AI_AVATAR = 'https://attach-sit.oss-cn-shanghai.aliyuncs.com/default/28a14b07da0d4e7684758a48649b5ad9.png?1=1';

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [pawPrints, setPawPrints] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [popBubble, setPopBubble] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 加载聊天历史记录
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('/api/chat/history', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }

        const data = await response.json();
        if (data.success) {
          // 直接使用返回的历史记录
          setMessages(data.history);
        }
      } catch (error) {
        console.error('加载聊天历史失败:', error);
      }
    };

    loadChatHistory();
  }, []);

  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      type: 'user',
      content: inputMessage
    };

    const currentMessage = inputMessage;
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('未登录或登录已过期，请重新登录');
      }

      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: currentMessage })
      });

      if (response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (data.success) {
        const aiMessage = {
          type: 'ai',
          content: data.message
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.message || '发送消息失败');
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      const errorMessage = {
        type: 'error',
        content: error.message || '发送消息失败，请稍后重试',
        id: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      setTimeout(() => {
        setMessages(prev => prev.filter(msg => msg.id !== errorMessage.id));
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 检查文件大小
    if (file.size > 50 * 1024 * 1024) {
      setMessages(prev => [...prev, {
        type: 'error',
        content: '文件大小不能超过50MB',
        id: `error-${Date.now()}`
      }]);
      event.target.value = '';
      return;
    }

    setIsFileLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/chat/file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(response.status === 413 ? '文件太大' : '文件处理失败');
      }

      const data = await response.json();
      if (data.success) {
        const timestamp = Date.now();
        setMessages(prev => [...prev, 
          {
            type: 'user',
            content: `📎 ${file.name}`,
            isFile: true,
            id: `file-${timestamp}`  // 文件消息ID
          },
          {
            type: 'ai',
            content: data.message,
            id: `ai-${timestamp}`    // AI回复消息ID
          }
        ]);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('文件处理失败:', error);
      setMessages(prev => [...prev, {
        type: 'error',
        content: error.message || '文件处理失败，请稍后重试',
        id: `error-${Date.now()}`  // 错误消息ID
      }]);
    } finally {
      setIsFileLoading(false);
      event.target.value = '';
    }
  };

  const handleAvatarClick = (e) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight * 0.3;  // 调整到屏幕上方 30% 的位置
    
    setPopBubble({
      id: Date.now(),
      x: centerX,
      y: centerY,
      text: `${user.nickname} 拍了拍小肉熊🐾`
    });

    setTimeout(() => {
      setPopBubble(null);
    }, 2000);  // 缩短显示时间为 2 秒
  };

  return (
    <div className="chat-container" onClick={handleClick}>
      <div className="chat-header">
        <h2>小肉熊AI助手</h2>
        <img 
            src={user.avatar} 
            alt={user.nickname} 
            className="user-avatar"
         />
      </div>
      <div className="messages-container">
        {messages.map((message, index) => (
          <div 
            key={message.id || `msg-${Date.now()}-${index}`}  // 使用消息ID或生成唯一key
            className={`message ${message.type}`}
          >
            {message.type === 'ai' ? (
              <img 
                src={AI_AVATAR} 
                alt="AI" 
                className="avatar" 
                onClick={handleAvatarClick}
              />
            ) : message.type === 'user' ? (
              <img src={user.avatar} alt={user.nickname} className="avatar" />
            ) : null}
            <div className="message-content">
              {message.isFile ? (
                <div className="file-message">
                  <span className="file-icon">📄</span>
                  <span 
                    className="file-name" 
                    title={message.content.replace('📎 ', '')}
                  >
                    {message.content.replace('📎 ', '')}
                  </span>
                </div>
              ) : (
                <div className="text-content">{message.content}</div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message ai">
            <img src={AI_AVATAR} alt="AI" className="avatar" />
            <div className="message-content">
                <span className="loading-text">小肉熊正在思考...🐾</span>
              </div>
          </div>
        )}
        {isFileLoading && (
          <div className="message ai">
            <img src={AI_AVATAR} alt="AI" className="avatar" />
            <div className="message-content">
                <span className="loading-text">正在解析文件...📄</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-container">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        <button 
          className="upload-button"
          onClick={() => fileInputRef.current.click()}
          disabled={isLoading || isFileLoading}
        >
          <BsFileEarmarkArrowUp className="icon" />
        </button>
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="和小肉熊聊聊天吧~ 按Enter发送 🐾"
        />
        <button 
          onClick={handleSend} 
          disabled={isLoading || isFileLoading}
          className="send-button"
        >
          <RiSendPlaneFill className="icon" />
        </button>
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
      {popBubble && (
        <div
          className="pop-bubble"
          style={{
            left: popBubble.x,
            top: popBubble.y
          }}
        >
          {popBubble.text}
        </div>
      )}
    </div>
  );
};

export default Chat;
