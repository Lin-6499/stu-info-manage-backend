import express from "express";
import {processToken,verifyToken} from "../Token.js";
import {upload} from "../getDifficultFile.js";
import path from "path";
import {studentsDB} from "../../Database/db.js";
const applyRoute = express.Router();
// POST /api/apply
applyRoute.post('/apply/difficult', upload.array('files', 3), async (req, res) => {
    const data = verifyToken(req)
    if(processToken(data).error){
        return res.status(401).json({
            message:processToken(data).error,
            error:processToken(data).error
        })
    }
    const stuID = processToken(data).stuID

    try {
        const { income, description } = req.body
        // 获取上传的文件路径
        const proofImages = req.files?.map(file => {
            return `/uploads/${file.filename}`
        }) || []
        const strProofImages = JSON.stringify(proofImages)
        console.log('proofImages', proofImages);
        // 保存到数据库
        const saveResult = await studentsDB.addDifficultyApply(stuID,strProofImages,income,description);
        console.log("save", saveResult)
        if (!saveResult) {
            throw new Error('申请提交失败：学生不存在或数据库错误');
        }
        // 返回成功响应（可包含文件访问 URL）
        res.status(201).json({
            message: '申请提交成功',
            data: {
                rows: saveResult,
                proofUrls: proofImages.map(p => `/uploads/${path.basename(p)}`)
            }
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: '服务器内部错误' })
    }
})
applyRoute.post('/apply/addRecords',async (req,res) => {
    const data = verifyToken(req)
    if(processToken(data).error){
        return res.status(401).json({
            message:processToken(data).error,
            error:processToken(data).error
        })
    }
    const stuID = processToken(data).stuID
    const insertValue = {
        student_id:stuID,
        ...req.body
    }
    console.log('insertValue', insertValue)
    const result = await studentsDB.addRecordsApply(insertValue)
    if(result){
        res.status(200).json({
            success: 'ok',
        })
    }
})
applyRoute.delete('/apply/deleteRecords',async (req,res) => {
    const data = verifyToken(req)
    if(processToken(data).error){
        return res.status(401).json({
            message:processToken(data).error,
            error:processToken(data).error
        })
    }
    const stuID = processToken(data).stuID
    const result = studentsDB.deleteRecord(stuID)
    if(!result){
        return res.status(401).json({
            fail:'销假失败'
        })
    }
    res.status(200).json({
        success: 'ok',
    })
})
export default applyRoute;