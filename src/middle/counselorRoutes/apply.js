import express from "express";
import {processToken, verifyToken} from "../Token.js";
import {counselorDB} from "../../Database/db.js";

export const applyRoute = express.Router()

applyRoute.post('/apply/reviewDifficulty',async (req,res)=>{
    const data = verifyToken(req)
    if(processToken(data).error){
        return res.status(401).json({
            message:processToken(data).error,
            error:processToken(data).error
        })
    }
    const {status,review_at,student_id}=req.body;
    const alertResult = await counselorDB.alertDifficultyApply(status,review_at,student_id);
    if(alertResult==null){
        return res.status(401).json({
            message: '审批失败',
            error: '审批失败'
        })
    }
    res.status(200).json({
    })
})