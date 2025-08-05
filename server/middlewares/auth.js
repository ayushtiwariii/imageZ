import jwt from 'jsonwebtoken'

const authUser = async(req,res,next)=>{
    const {token} = req.headers
    if(!token){
        return res.json({success: false ,message : 'Not Authorized Login '})
    }
    try{
        const token_decode=jwt.verify(token,process.env.JWT_SECRET)
        if(token_decode.id){
            req.body.userID = token_decode.id;

        }else{
            return res.json({sucess:false ,message :"Not authorized login again "})
        }
        next();
    }
    catch(error){
        console.log(error)
        res.json({sucess:false , message:error.message})
    }
}

export default authUser ;