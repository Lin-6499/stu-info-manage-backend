// 使用dotenv读取根目录下的.env文件
import dotenv from "dotenv";
dotenv.config({ path: '.env.server' });
import path from "path";
import {dirname,join} from "node:path";
import { fileURLToPath } from 'node:url';
import express from "express";
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

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
// app.use('/api/counselor',authRouter);
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});