const jwt=require('jsonwebtoken');
const multer=require('multer');
const bcrypt=require('bcryptjs');
const {userModel}=require('../db/model');

module.exports={
    authenticate: (req,res,next)=>{
        var token=req.header('x-auth');
        userModel.findByToken(token).then(resp=>{
            req.user=resp;
            console.log(resp);
            req.token=token;
            next();  
        }).catch(err=>{
            res.status(400).json({message:'Authorization required. Sign in to continue.'});
        })
    }  
}