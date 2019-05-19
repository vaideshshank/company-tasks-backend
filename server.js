const express=require('express');
const bodyParser=require('body-parser');
const app=express();
const cors=require('cors');
const {saveClient,saveUser,getClients,singleClient,
    saveTask,listTasks,addClientToTask,deleteTask,
    getClientsWithTasks,removeClientsFromTasks}=require('./db/model');

app.use(bodyParser.urlencoded({extended:false}));
// Too important
app.use(express.json());
app.use(cors());

require('dotenv').config();
const port=process.env.PORT;

app.post('/api/clientForm',saveClient);
app.post('/api/userForm',saveUser);
app.get('/api/clients',getClients);
app.get('/api/singleClient/:id',singleClient);
app.post('/api/tasks',saveTask);
app.get('/api/listTasks',listTasks);
app.post('/api/addClientToTask',addClientToTask);
app.get('/api/clientsWithTasks/:id',getClientsWithTasks);
app.post('/api/removeClientFromTask',removeClientsFromTasks);
app.post('/api/deleteTask',deleteTask);

app.listen(port,()=>{
    console.log("Inintialized");
})
