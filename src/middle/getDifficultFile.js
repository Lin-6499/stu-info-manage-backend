// utils/upload.js
import multer from "multer";
import path from "path";
import fs from "fs";
import {fileURLToPath} from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../', 'access', 'upload');
// 确保 uploads 目录存在
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        const uniqueName = `proof_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`
        cb(null, uniqueName)
    }
})

export const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true)
        } else {
            cb(new Error('只允许上传图片'), false)
        }
    }
})
