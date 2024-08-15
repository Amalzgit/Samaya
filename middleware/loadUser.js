const User =require('../models/userModel')

module.exports =loadUser = async (req, res, next) => {
    try {
      if (req.user) {
        req.currentUser = req.user;
      } else if (req.session && req.session.user_id) {
        const user = await User.findById(req.session.user_id);
        req.currentUser = user;
         
      } else {
        req.currentUser = null;
      }
      
      
      
      next();
    } catch (error) {
      console.error("Error loading user:", error);
      next(); // or res.status(500).json({ success: false, message: "An error occurred while loading user details" });
    }
  };