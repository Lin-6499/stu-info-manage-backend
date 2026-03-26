import express from "express";
import {studentsDB} from "../../Database/db.js";
import {transformToScheduleTable} from "../transformSchedule.js";
import {processToken, verifyToken} from "../Token.js";
import axios from "axios";

const infoSelect = express.Router()
// 课表
infoSelect.get('/info/getSchedule',async (req,res)=>{
    const weekTime = req.query.weekTime;
    const semester = req.query.semester;
    // 解析token
    const data = verifyToken(req)
    if(processToken(data).error){
        return res.status(401).json({
            message:processToken(data).error,
            error:processToken(data).error
        })
    }
    const stuID = processToken(data).stuID
    console.log('data',data)
    const schedule = await studentsDB.getStudentSchedule(weekTime,stuID,semester)
    if (!schedule){
        res.status(200).json({
            schedule: null
        })
    }
    const result = transformToScheduleTable(schedule)
    console.log(result)
    res.status(200).json({
        schedule:result
    })
})
// 所有成绩查询
infoSelect.get('/info/getGradesInquiry',async (req,res)=>{
    const data = verifyToken(req)
    if(processToken(data).error){
        return res.status(401).json({
            message:processToken(data).error,
            error:processToken(data).error
        })
    }
    const stuID = processToken(data).stuID
    const grades = await studentsDB.getGradesInquiry(stuID)
    console.log('grades',grades)
    res.status(200).json({
        grades//********//
    })
})
// 罗列课表
infoSelect.get('/info/getCourseList',async (req,res)=>{
    const className = req.query.className
    try{
        const cList = await studentsDB.getCourseList(className)
        res.status(200).json({
            courseList:cList
        })
    }catch(err){
        res.status(500).json({
            error:"没有查到"
        })
    }
})
infoSelect.get('/info/getLocation',async (req,res)=>{
    const AMAP_REVERSE_GEOCODE_URL = 'https://restapi.amap.com/v3/geocode/regeo'
    try {
        const { lng, lat } = req.query
        // 参数校验
        if (!lng || !lat) {
            return res.status(400).json({ error: '缺少经纬度参数' })
        }
        const lngNum = parseFloat(lng)
        const latNum = parseFloat(lat)
        if (isNaN(lngNum) || isNaN(latNum)) {
            return res.status(400).json({ error: '经纬度格式无效' })
        }
        // 调用高德 API
        const response = await axios.get(AMAP_REVERSE_GEOCODE_URL, {
            params: {
                key: 'e45c598b6700af6919375e99bc25a1ad',
                location: `${lngNum},${latNum}`,
                extensions: 'all',
                radius: 10,
                roadlevel: 0
            },
            timeout: 5000 // 5秒超时
        })
        const data = response.data
        // 检查高德返回状态
        if (data.status !== '1') {
            console.error('高德API错误:', data.info, data.infocode)
            return res.status(500).json({ error: '地址解析服务异常' })
        }
        // 提取需要的字段（避免透传整个响应）
        const { regeocode } = data
        const result = {
            fullAddress: regeocode.formatted_address || '',
            province: regeocode.addressComponent?.province || '',
            city: regeocode.addressComponent?.city || regeocode.addressComponent?.province || '',
            district: regeocode.addressComponent?.district || '',
            township: regeocode.addressComponent?.township || '',
            street: regeocode.addressComponent?.streetNumber?.street || '',
            number: regeocode.addressComponent?.streetNumber?.number || '',
            latitude: latNum,
            longitude: lngNum
        }
        res.json(result)
    } catch (error) {
        console.error('逆地理编码失败:', error.message)
        if (error.code === 'ECONNABORTED') {
            return res.status(500).json({ error: '地址服务请求超时' })
        }
        res.status(500).json({ error: '服务器内部错误' })
    }
})
infoSelect.get('/info/selectRecords',async (req,res)=>{
    const data = verifyToken(req)
    if(processToken(data).error){
        return res.status(401).json({
            message:processToken(data).error,
            error:processToken(data).error
        })
    }
    const student_id = processToken(data).stuID
    console.log('student_id',student_id)
    const result = await studentsDB.selectRecord(student_id)
    if(result === null) {
        return res.status(200).json({
            result
        })
    }
    res.status(200).json({
        result
    })
})

infoSelect.get('/info/selectDifficulty',async (req,res)=>{
    const data = verifyToken(req)
    if(processToken(data).error){
        return res.status(401).json({
            message:processToken(data).error,
            error:processToken(data).error
        })
    }
    const student_id = processToken(data).stuID
    console.log('student_id',student_id)
    const result = await studentsDB.selectDiffcult(student_id)
    if(result === null) {
        return res.status(200).json({
            result
        })
    }
    res.status(200).json({
        result
    })
})
export default infoSelect