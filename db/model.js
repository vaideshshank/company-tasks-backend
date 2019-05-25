const mongoose=require('mongoose');
var _=require('lodash');
var {connect,clientModel,userModel,taskModel,taskModel}=require('./schema');
connect();
clientModel=clientModel();userModel=userModel();taskModel=taskModel();

var saveClient=(req,res)=>{
    var {name,email,phone,address,profession,image}=req.body;
    //To be removed after making jwt auth
    console.log(image);
    var user='5cdf185ef5cc7026484a3813';
    if(!image){image='uploads/placeholder.jpg'}
    //console.log({name,email,phone,address,profession,image});
    var client=new clientModel({name,email,phone,address,profession,image,user})
    client.save().then(()=>{
        console.log('CLIENT information saved');
        res.status(200).json({message:"CLIENT information saved"});
    }).catch(err=>{
        console.log(err);
        res.status(400).json({message:"CLIENT info not saved. Server failure."});
    })
    //res.end();
}

var saveUser=(req,res)=>{
    var {name,username,password,email}=req.body;
    var user=new userModel({name,email,username,password})
    user.save().then(()=>{
        console.log('USER information saved');
        return user.generateAuthToken();
    }).then(token=>{
        res.status(200).header('x-auth',token).json({message:'USER information saved'});
    })
    .catch(err=>{
        console.log(err);
        res.status(400).json({message:"USER info not saved. Server failure."});
    })
}

var getClients=(req,res)=>{
    var user='5cdf185ef5cc7026484a3813';
    clientModel.find({user},"_id name email profession").then((data)=>{
        res.status(200).json(data);
    })
}

var singleClient=(req,res)=>{
    var {id}=req.params;
    console.log(id);
    var user='5cdf185ef5cc7026484a3813';
    clientModel.findOne({_id:id,user}).then(data=>{
        return data;
    }).then((clientData)=>{
        taskModel.find({user},'taskname description date_created description').then(data=>{
            clientData={clientData,tasks:data};
            res.status(200).json(clientData);
        })
    })
    .catch(err=>{
        res.status(400).send({message:'Server failure'});
    })
}

var saveTask=(req,res)=>{
    //modify the user parameter later
    var {taskname,description,duration}=req.body;
    var user='5cdf185ef5cc7026484a3813';
    var task=new taskModel({taskname,description,duration,user});
    task.save().then(()=>{
        console.log("TASK saved");
        res.status(200).json({message:'TASK saved'});
    }).catch(err=>{
        console.log(err);
        res.status(400).json({message:'TASK NOT saved'});
    })
}

var listTasks=(req,res)=>{
    var user='5cdf185ef5cc7026484a3813';
    taskModel.find({user},"taskname description duration").then((tasks)=>{
        res.status(200).json({tasks});
    }).catch(err=>{
        console.log(err);
        res.status(400).json({message:'Server failure'});
    })
}

var addClientToTask=(req,res)=>{
    var {user_id,client_id,task_id,duration}=req.body;
    user_id='5cdf185ef5cc7026484a3813';
    console.log({user_id,client_id,task_id,duration});
    taskModel.update({user:user_id,_id:task_id},{$push:{clients:{id:client_id,duration}}}).then((data)=>{
        console.log(data);
        res.status(200).json({message:'Client Added to Task'});
    }).catch(err=>{
        console.log(err);
        res.status(400).json({message:'Client NOT Added to Task. Server failure'});
    })
}

var getClientsWithTasks=(req,res)=>{
    var {id}=req.params,user='5cdf185ef5cc7026484a3813';
    taskModel.find({"clients.id":id,user},'_id clients').then((data)=>{
        var clientInfo=[];
        _.each(data,({clients},ind)=>{
            clientInfo=_.filter(clients,(single,ind)=>{
                return single.id==id;
            });
            var timeInfo={};
            _.map(clientInfo,({duration},ind)=>{
                timeInfo={duration};
            })
            data[ind].clients=timeInfo;
        })
        res.status(200).json(data);
    }).catch(err=>{
        console.log(err);
        res.status(400).json({message:'Server failure'});
    })
}

var removeClientsFromTasks=(req,res)=>{
    var {client_id,user_id,task_id}=req.body;
    console.log(task_id,client_id);
    user_id="5cdf185ef5cc7026484a3813";
    taskModel.update({_id:task_id,user:user_id},{$pull:{
        clients:{id:client_id}
    }},{multi:true}).then(()=>{
        res.status(200).json({message:"Client REMOVED from task"});
    }).catch(err=>{
        console.log(err);
        res.status(400).json({message:"Client NOT removed. Server failure."});
    })
}

var deleteTask=(req,res)=>{
    var {task_id,user_id}=req.body;
    user_id="5cdf185ef5cc7026484a3813";
    taskModel.findOneAndDelete({_id:task_id,user:user_id}).then(()=>{
        res.status(200).json({message:'Task removed from account'});
    }).catch(err=>{
        console.log(err);
        res.status(400).json({message:'Task not removed from account. Server failure'});
    })
}

var assignedTasks=(req,res)=>{
    var user='5cdf185ef5cc7026484a3813';
    taskModel.find({user},"taskname description clients").then((tasks)=>{
        return tasks;
    }).then((tasks)=>{
        var allTasks=[];
        allTasks=_.map(tasks,async (task)=>{  
            var obj=[];
            _.each(task.clients,({id})=>{
                obj.push({_id:id});
            });
            return clientModel.find({$or:obj},"name").then(names=>{
                task.clients=names;
                console.log(task);
                return task;
            }).catch(err=>{
                return {task,clients:[]};
            })
            
        });
        return res.status(200).json(allTasks);
    })
    .catch(err=>{
        console.log(err);
        res.status(400).json({message:'Server failure'});
    })
}

var uploadImg=(req,res)=>{
    if(req.file) {
        res.status(200).json({
            'message':'Image uploaded successfully',
            'path':req.file.path
        });
    }
    else{
        console.log('error')
    };
}

module.exports={saveClient,saveUser,getClients,singleClient,saveTask,assignedTasks,
    listTasks,addClientToTask,getClientsWithTasks,removeClientsFromTasks,deleteTask,uploadImg};