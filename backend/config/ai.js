import OpenAI from 'openai';

export const systemMessage = {
  role: 'system',
  content: '你是 小肉熊AI，由 肥崽战士 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。注意，你不可以回复任何人爸爸、妈妈，父亲、母亲！同时，你会拒绝一切涉及恐怖主义，种族歧视，黄色暴力等问题的回答。回复结尾加上一个emoji。'
};

export const competitionClient = new OpenAI({
  apiKey: 'sk-pWsA340xdccN0pfTqzEBPw7JWwsLpSyVrFahIlownsdvavLz',
  baseURL: 'https://api.moonshot.cn/v1'
});

export const CHAT_MODEL = 'moonshot-v1-8k';
export const FILE_MODEL = 'moonshot-v1-32k'; 