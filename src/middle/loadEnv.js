// server/src/utils/loadEnv.js
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

/**
 * 从指定相对路径加载 .env 文件（相对于调用此函数的文件）
 * @param {string} relativePath - 相对于调用文件的 .env 路径（如 '../../.env.server'）
 */
export function loadEnv(relativePath = '.env') {
    const callerFile = new Error().stack.split('\n')[2].trim(); // 获取调用者位置（简单版）
    // 更可靠的方式：要求传入 import.meta.url
}

/**
 * 推荐：显式传入 import.meta.url
 * @param {string} metaUrl - 调用者的 import.meta.url
 * @param {string} relativePath - 相对于调用者文件的 .env 路径
 */
export function loadEnvFrom(metaUrl, relativePath = '.env') {
    const __filename = fileURLToPath(metaUrl);
    const __dirname = dirname(__filename);
    const envPath = resolve(__dirname, relativePath);

    const result = dotenv.config({ path: envPath });
    if (result.error) {
        throw new Error(`Failed to load env file at ${envPath}: ${result.error.message}`);
    }

    return envPath;
}