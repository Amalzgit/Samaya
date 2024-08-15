


module.exports= async (req, res, next) => {
    
    const user =req.currentUser
    // console.log({user}); 
    if (user && user.isBlocked) {
        req.session.destroy(err => {
            if (err) {
              return next(err); 
            }
            return res.redirect('/blocked');
          });
        
    }
    next();
  };


