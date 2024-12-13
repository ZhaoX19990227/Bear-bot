// 配置minio
import { Client } from 'minio';

export const minioClient = new Client({
  endPoint: '120.46.13.61', // MinIO 服务器地址
  port: 9000, // MinIO 端口
  useSSL: false, // 如果使用 HTTPS，请设置为 true
  accessKey: 'ult5VNLmlf0AYFvnWDp5', // MinIO 访问密钥
  secretKey: 'wWel7LC1cuRzdwLFKsLOusofVo7tsAsLPyMHIzqN' // MinIO 秘密密钥
});
