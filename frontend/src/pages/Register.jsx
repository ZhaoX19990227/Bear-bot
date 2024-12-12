import { api } from '../utils/api';

const handleSendCode = async () => {
  try {
    const response = await api.sendRequest('/api/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    if (data.success) {
      message.success('验证码已发送');
      startCountdown();
    } else {
      message.error(data.message);
    }
  } catch (error) {
    console.error('发送验证码失败:', error);
    message.error('发送验证码失败');
  }
}; 