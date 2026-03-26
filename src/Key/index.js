import crypto from "crypto";
// 生成服务器密钥
const secretKey = crypto.randomBytes(32).toString('base64');
console.log("secretKey", secretKey)