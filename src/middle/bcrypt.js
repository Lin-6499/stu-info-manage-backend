// utils/bcrypt.js
import bcrypt from 'bcrypt'; // 或 'bcryptjs'（纯 JS，无需编译）

const COST = 12; // 开发可设为 10，生产建议 12

/**
 * 加密明文密码
 * @param {string} plainPassword - 用户输入的原始密码
 * @returns {Promise<string>} - 返回 bcrypt 哈希字符串
 */
export const bcryptPassword = async (plainPassword) => {
    if (!plainPassword || typeof plainPassword !== 'string') {
        throw new Error('Password must be a non-empty string');
    }
    return await bcrypt.hash(plainPassword, COST);
};

/**
 * 验证密码是否匹配
 * @param {string} plainPassword - 用户登录时输入的密码
 * @param {string} hashFromDB - 数据库中存储的哈希值
 * @returns {Promise<boolean>} - 匹配返回 true，否则 false
 */
export const bcryptCompare = async (plainPassword, hashFromDB) => {
    if (!plainPassword || !hashFromDB) return false;
    try {
        return await bcrypt.compare(plainPassword, hashFromDB); // 👈 必须 return！
    } catch (error) {
        // 某些无效哈希格式可能导致 compare 抛错（如非 bcrypt 字符串）
        console.warn('Password comparison failed:', error.message);
        return false;
    }
};