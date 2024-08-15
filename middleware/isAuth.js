module.exports =(req,res,next) =>{
    if(req.session && (req.session.user_id || req.isAuthenticated())){
        next()
    }else{
        return res.redirect('/login')
    }
}