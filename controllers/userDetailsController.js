const User =require('../models/userModel')



const loadUserDetails =async (req,res)=>{
    try {
        const user = await User.findById(req.session.user_id); 
        return res.render('userDetails', { user,successMessage:'',errorMessage:''});
    } catch (error) {
        const user = await User.find()
        console.log('Error loading user details',error);
        return res.render('userDetails',{user,successMessage:'', errorMessage: "An error occurred while rendering user detials" })
    }
}


const updateUSer =async(req,res)=>{

    const { firstName, lastName, email, phone, newPassword,confirmPassword } = req.body;
try {
    const user = await User.findById(req.session.user_id); 
    if(!user){
        return res.render('userDetails',{ user, successMessage: '', errorMessage: "User not found" })
    }

    user.firstName =firstName || user.firstName
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.phone = phone || user.phone
    
    if (newPassword && confirmPassword && newPassword === confirmPassword) {
        
        user.password = confirmPassword || user.password;
    }

    await user.save()

    req.session.user =user
return res.redirect('/user-details')
} catch (error) {
    console.log('Error while updating user',error);
    return res.render('userDetails', { user: req.body, successMessage: '', errorMessage: "Error updating user" });

}
}
module.exports ={
    loadUserDetails,
    updateUSer
}