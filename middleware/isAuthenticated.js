module.exports =(req,res,next)=>{
    
    if (req.session && (req.session.user_id || req.isAuthenticated())) {
        res.locals.isAuthenticated = true;
    } else {
        res.locals.isAuthenticated = false;
    }
    next(); 
}