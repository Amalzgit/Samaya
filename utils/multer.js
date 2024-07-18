const multer = require('multer');


const storage  = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads/products');
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now()+'-'+ file.originalname);
    }
});

const upload =multer({
    storage:storage,
    limits:{fileSize: 1024 *1024 * 5 }
});

module.exports =upload