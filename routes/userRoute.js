const express = require('express')
const user_route= express.Router();
const userController =require('../controllers/userController')

// multer

const multer =require('multer');

const path =require('path')

const storage =multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/userImages'))

    },
    filename:function(req, file, cb){
        cb(null, Date.now() + '-' + file.originalname);

    }

});
const upload =multer({storage:storage})


user_route.get('/register',userController.loadRegister)

user_route.post('/register',upload.single('image') ,userController.insertUser)



module.exports =user_route