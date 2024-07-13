if(process.env.NOD_ENV !=='production'){
    require('dotenv').config();
}
module.exports ={
    port : process.env.PORT || 3000,
    host : process.env.PORT || 'localhost',
    sessionSecret : process.env.SESSION_SECRET

}