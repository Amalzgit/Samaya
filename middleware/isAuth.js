module.exports =(req,res,next) =>{
    if(req.session && req.session.user_id){
        next()
    }else{
        return res.redirect('/login')
    }
}