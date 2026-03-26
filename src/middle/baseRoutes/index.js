import {bcryptCompare, bcryptPassword} from "../bcrypt.js";
import {baseDB, counselorDB, studentsDB} from "../../Database/db.js";
import {createToken, processToken, verifyToken} from "../Token.js";
import express from "express";


const baseRouter = express.Router();
// 登陆请求
baseRouter.post('/login',async (req,res)=>{
    console.log(req.body)
    const {username,password}= req.body
    // 获取user_id
    const dbId = await baseDB.getID(username)
    console.log('user_id',dbId)
    const dbPassword = await baseDB.getPassword(dbId)
    const newPassword = await bcryptPassword(password)
    console.log('dbPassword',dbPassword)
    console.log('password',newPassword)
    const isRight = await bcryptCompare(password,dbPassword)
    console.log("密码",isRight)
    if(!isRight){
        res.status(401).json({
            message: '账号或密码错误！！！',
        })
    }else {
        const payload = {
            id:dbId
        }
        res.status(200).json({
            token: createToken(payload),
        })
    }
})
// 退出登陆
baseRouter.post('/logout',(req,res)=>{
    res.status(200).json({
        message: '退出登陆成功',
    })
})
baseRouter.get('/userInfo',async (req,res)=>{
    const data = verifyToken(req)
    if(processToken(data).error){
        return res.status(401).json({
            message:processToken(data).error,
            error:processToken(data).error
        })
    }
    const stuID = processToken(data).stuID
    console.log('data',stuID)
    const role = await baseDB.getUserRole(stuID)
    console.log('role',role)
    if (role==='student'){
        const userInfo = await studentsDB.getStuUserInfo(stuID)
        console.log('userInfo',userInfo)
        const counselorInfo = await studentsDB.getCounselorInfo(userInfo.class_name)
        return res.status(200).json({
            userInfo,
            counselorInfo
        })
    }else if(role==='counselor'){
        const userInfo = await counselorDB.getCslUserInfo(stuID)
        console.log('userInfo',userInfo)
        return res.status(200).json({
            userInfo
        })
    }
    return res.status(404).json({
        message: "该用户不存在",
    })

})

export default baseRouter