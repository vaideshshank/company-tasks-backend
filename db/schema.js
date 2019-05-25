const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');
const validator=require('validator');
const jwt=require('jsonwebtoken');
require('dotenv').config();


var connect=()=>{
    mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ds159036.mlab.com:59036/company-tasks`,
                        { useNewUrlParser: true }).then(()=>{
        console.log('Database connection made');
    }).catch(err=>{
        console.log(err);
    })
}

var userModel=()=>{
    var schema=mongoose.Schema({
        name:{type:String,required:true,trim:true},
        username:{type:String,required:true,trim:true,minlength:5,unique:true},
        email:{type:String,required:true,
            validate:{validator:(value)=>{
                return validator.isEmail(value)
            }}
        },
        password:{type:String,required:true},
        tokens:[{
            access:{type:String,required:true},
            token:{type:String,required:true}
        }]
    })

    schema.pre('save',function(next){
        var {password}=this;
        console.log({password})
        this.password=bcrypt.hashSync(password,12);
        next();
    });

    //instance method
    schema.methods.generateAuthToken=function(){
        var user=this,
            access='auth'
            token=jwt.sign({id:user._id,access},process.env.SECRET);
        user.tokens.push({access,token});
        return user.save().then(()=>{
            return new Promise((resolve,reject)=>{
                resolve(token);
            })
        })
    }

    schema.methods.removeToken=function(token){
        var user=this;
        return user.update({
            $pull:{
                tokens:{token}
            }
        })
    }

    //model methods
    schema.statics.signInToken=function(id){
        var User=this,access="auth";
        var token=jwt.sign({id,access},process.env.SECRET);
        console.log({token});
        return User.update({_id:id},{
            $push:{
                tokens:{access,token}
            }
        }).then(()=>{
            return new Promise((resolve,reject)=>{
                resolve(token);
            })
        }).catch(()=>{
            return Promise.reject('error');
        })
    }



    schema.statics.findByToken=function(token){
        var User=this;
        try{
            var {id}=jwt.verify(token,process.env.SECRET);
        }catch(e){
            return Promise.reject('Authorization required');
        }
        //console.log(id);
        
        return User.findOne({
            _id:id,
            'tokens.token':token,
            'tokens.access':'auth'
        },"name email username")
    }


    return new mongoose.model('User',schema);
}

var clientModel=()=>{
    var schema=mongoose.Schema({
        name:{type:String,required:true,trim:true},
        email:{type:String,required:true,
                validate:{validator:(value)=>{
                    return validator.isEmail(value)
                }}
            },
        phone:{type:String,required:true,trim:true,
                validate:{
                    validator:(val)=>{
                        return /^(\+\d{1,3}[- ]?)?\d{10}$/.test(val)
                    }
                }},
        address:{type:String,trim:true,required:true},
        profession:{type:String},
        image:{type:String},
        user:{type:mongoose.Schema.Types.ObjectId}
    });

    return new mongoose.model('Clients',schema);
}

var taskModel=()=>{
    var schema=mongoose.Schema({
        taskname:{type:String,required:true},
        description:{type:String,required:true},
        clients:[{
            id:{type:mongoose.Schema.Types.ObjectId,unique:true},
            duration:{type:String,validate:{validator:(val)=>{
                return /^(\d{1,2}[ ]?)?[A-Za-z]$/.test(val)
            }}}
        }],
        date_created:{type:mongoose.Schema.Types.Date,default:Date.now().toString()},
        duration:{type:String},
        user:{type:mongoose.Schema.Types.ObjectId,required:true}
    });
    return new mongoose.model('Tasks',schema);
}

module.exports={connect,clientModel,userModel,taskModel};