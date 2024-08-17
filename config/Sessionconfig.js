if(process.env.NOD_ENV !=='production'){
    require('dotenv').config();
}
const  sessionSecret  = process.env.SESSION_SECRET

module.exports ={
sessionSecret
}