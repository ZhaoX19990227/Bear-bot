import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// 根据环境加载对应的配置文件
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const isDev = process.env.NODE_ENV === 'development';

console.log('Current Environment:', process.env.NODE_ENV);
console.log('Database Config:', {
  host: process.env.DB_HOST,  // 使用环境变量中的 DB_HOST
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  isDev: isDev
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

pool.on('error', (err) => {
  console.error('Database pool error:', {
    code: err.code,
    errno: err.errno,
    syscall: err.syscall,
    fatal: err.fatal,
    message: err.message
  });
});

const testConnection = async () => {
  try {
    console.log('Testing database connection...');
    const connection = await pool.getConnection();
    await connection.ping();
    console.log('Database connection successful!');
    connection.release();
  } catch (error) {
    console.error('Error connecting to the database:', {
      code: error.code,
      errno: error.errno,
      syscall: error.syscall,
      fatal: error.fatal,
      message: error.message
    });
    if (isDev) {
      throw error;
    }
  }
};

testConnection();

export default pool; 