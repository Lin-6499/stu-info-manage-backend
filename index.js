// 使用dotenv读取根目录下的.env文件
import dotenv from "dotenv";
dotenv.config({ path: '.env.server' });
import path from "path";
import {dirname,join} from "node:path";
import { fileURLToPath } from 'node:url';
import express from "express";

// 🔥 加载 HTTPS 所需模块
import https from "https";
import fs from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json())
app.use(express.static(join(__dirname,'src','access')));
const PORT = process.env.PORT || 3000;

import baseRouter from "./src/middle/baseRoutes/index.js";
import {stuRoutes} from "./src/middle/studentsRoutes/index.js";
import {counselorRoutes} from "./src/middle/counselorRoutes/index.js";
import {processToken, verifyToken} from "./src/middle/Token.js";
app.use('/uploads', express.static(path.resolve(__dirname,'src','access','upload')));

// 基础api
app.use('/api/auth',baseRouter);
/**
 * 学生
 */
app.use('/api/students',stuRoutes);
/**
 * 辅导员
 */
app.use('/api/counselor',counselorRoutes);

// ===========================================
// 启动 HTTPS 服务
// ===========================================
const sslOptions = {
    key: fs.readFileSync(`${__dirname}/private-key.pem`),
    cert: fs.readFileSync(`${__dirname}/certificate.pem`),
};

// 创建 HTTPS 服务器
https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`✅ HTTPS 后端运行中：https://43.138.138.136:${PORT}`);
});