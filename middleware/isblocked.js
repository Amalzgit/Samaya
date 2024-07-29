const User = require('../models/userModel');


module.exports= async (req, res, next) => {
    const userId =  req.session.user_id
    const user =await User.findById(userId)
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


