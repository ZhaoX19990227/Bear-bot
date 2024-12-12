// 根据环境使用不同的 BASE_URL
const API_BASE_URL = import.meta.env.DEV 
  ? '/api'  // 开发环境使用相对路径，由 Vite 代理
  : '/api'; // 生产环境使用相对路径，由 Nginx 代理

export const api = {
  async sendRequest(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      return response;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
}; 