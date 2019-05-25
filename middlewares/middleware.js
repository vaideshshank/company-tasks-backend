const jwt=require('jsonwebtoken');
const multer=require('multer');

module.exports={
    verifyUser: (req,res,next)=>{
        var {id}=require('x-auth');
        
        next();
    }
}