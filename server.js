const express=require('express');
const bodyParser=require('body-parser');
const jwt=require('jsonwebtoken');
const {verifyUser}=require('./middlewares/middleware');
const app=express();
const cors=require('cors');
const multer=require('multer');
const path=require('path');
const {authenticate}=require('./middlewares/middleware');


const {saveClient,saveUser,getClients,singleClient,assignedTasks,
    saveTask,listTasks,addClientToTask,deleteTask,signIn,signout,
    getClientsWithTasks,removeClientsFromTasks,uploadImg}=require('./db/model');


//middlewares
var storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, './uploads') //Destination folder
        },
        filename: function (req, file, cb) {
          cb(null, 'img'+Date.now()+'.jpg') //File name after saving
        }
    })  
upload=multer({storage, 
    fileFilter: function (req, file, cb) {
        var filetypes = /jpeg|jpg|png/;
        var mimetype = filetypes.test(file.mimetype);
        var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb("Error: File upload only supports the following filetypes - " + filetypes);
        }
});
    

app.use(bodyParser.urlencoded({extended:false}));
app.use(express.json());    // Too important
app.use(cors({exposedHeaders:'x-auth'}));  //to expose jwt tokens still not working
app.use(express.static(__dirname))
//app.use('/api/signin',presignin);
//app.use('/api/upload',uploadImage);
//app.use('*',verifyUser);

require('dotenv').config();
const port=process.env.PORT;

app.post('/api/clientForm',authenticate,saveClient);
app.post('/api/userForm',saveUser);
app.post('/api/signin',signIn);
app.get('/api/signout',authenticate,signout);
app.get('/api/clients',authenticate,getClients);
app.get('/api/singleClient/:id',authenticate,singleClient);
app.post('/api/tasks',authenticate,saveTask);
app.get('/api/listTasks',authenticate,listTasks);
app.post('/api/addClientToTask',authenticate,addClientToTask);
app.get('/api/clientsWithTasks/:id',authenticate,getClientsWithTasks);
app.post('/api/removeClientFromTask',authenticate,removeClientsFromTasks);
app.post('/api/deleteTask',authenticate,deleteTask);
app.get('/api/assignedTasks',authenticate,assignedTasks);
app.post('/api/upload',upload.single('photo'),uploadImg);


app.listen(port,()=>{
    console.log("Inintialized");
})
