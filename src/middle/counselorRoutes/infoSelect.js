import express from "express";
import {processToken, verifyToken} from "../Token.js";
import {counselorDB} from "../../Database/db.js";
import {transformToScheduleTable} from "../transformSchedule.js";

const infoSelect = express.Router();

infoSelect.get('/info/getSchedule',async (req,res)=>{
    const weekTime = req.query.weekTime
    const semester = req.query.semester
    const data = verifyToken(req)
    if(processToken(data).error){
        return res.status(401).json({
            message:processToken(data).error,
            error:processToken(data).error
        })
    }
    const counselor_id = processToken(data).stuID
    const schedule = await counselorDB.getCounselorSchedule(counselor_id,semester,weekTime)
    if (!schedule){
        return res.status(200).json({
            schedule: null
        })
    }
    const result = transformToScheduleTable(schedule)
    console.log(result)
    res.status(200).json({
        schedule:result
    })

})
infoSelect.get('/info/getDifficultyList',async (req,res)=>{
    const user_id = req.query.user_id
    try{
        const result = await counselorDB.getDifficultyList(user_id)
        if (!result){
           throw new Error("Counselor list not found")
        }
        console.log('困难生',result)
        res.status(200).json({
            difficultyList: result
        })
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
})
infoSelect.get('/info/getRecords',async (req,res)=>{
    const user_id = req.query.user_id
    try {
        const result = await counselorDB.getRecordsList(user_id)
        if (!result){
            throw new Error("Counselor list not found")
        }
        res.status(200).json({
            records: result
        })
    }catch (err){
        res.status(500).json({
            message:err.message
        })
    }
})
infoSelect.post('/info/reviewRecords',async (req,res)=>{
    const data = verifyToken(req)
    if(processToken(data).error){
        return res.status(401).json({
            message:processToken(data).error,
            error:processToken(data).error
        })
    }
    const {status,student_id} = req.body
    const result = await counselorDB.alertRecordsStatus(student_id,status)
    if (!result){
        return res.status(401).json({
            message: '审批失败',
            error: '审批失败'
        })
    }
    res.status(200).json({})
})

export default infoSelect