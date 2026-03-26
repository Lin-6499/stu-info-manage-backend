import jwt from 'jsonwebtoken'



const createToken =(data)=>{
    // 获取环境变量密钥 验证密钥存在
    const secretKey = process.env.JWT_SECRET_KEY;
    console.log("secretKey", secretKey);
    if (!secretKey) {
        throw new Error("The JWT_SECRET_KEY required");
    }
    //  选择算法
    const algorithm = process.env.JWT_ALGORITHM;
    //  令牌生命周期
    const tokenLifeCycle = process.env.JWT_TOKEN_LIFECYCLE;
    const token = jwt.sign(data, secretKey,{
        algorithm: algorithm,
        expiresIn: tokenLifeCycle
    });
    console.log('token',token)
    return token;
}
// token验证
const verifyToken = (req)=>{
    const Authorization = req.headers.authorization;
    const token = Authorization.split(' ')[1];
    if(!token){
        return null
    }
    const secretKey = process.env.JWT_SECRET_KEY;
    try{
        const decoded = jwt.verify(token, secretKey)
        return {
            valid:true,
            data:decoded.id
        };
    }catch(err){
        return {
            valid:false,
            error:err
        }
    }
}
// // 对客户端token进行验证
// const resTokenVerification=(req)=>{
//     const Authorization = req.headers.authorization;
//
//     // 判断请求头是否返回正确的token格式  是否为空 是否有前缀
//     // if(!Authorization||!Authorization.startsWith('Bearer ')){
//     //     return res.status(401).json({
//     //         message: "Authorization's format is error OR Authorization is null"  ,
//     //         error:Authorization
//     //     })
//     // }
//     const token = Authorization.split(' ')[1];
//     console.log('token0',token)
//     if(!token){
//         return null
//     }
//     return token;
// }
const processToken=(result)=>{
    if(!result){
        return {
            error:"token is null"
        }
    }
    if(!result.valid){
        return {
            error:result.error
        }
    }
    return {
        stuID:result.data
    }
}
export {createToken,verifyToken,processToken};