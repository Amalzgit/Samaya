const User =require('../../models/userModel')




const loadAdminProfile =async (req,res)=>{
    try {
        const admin = await User.findById(req.session.user_id); 
        
        const users = await User.find({isAdmin:false})
        return res.render('adminProfle', { admin,users,successMessage:'',errorMessage:''});
    } catch (error) {
        const admin = await User.findById(req.session.user_id)
        console.log('Error loading user details',error);
        return res.render('adminProfle',{admin,successMessage:'', errorMessage: "An error occurred while rendering user detials" })
    }
}

const blockUser = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        if (!user_id) {
            console.log('User ID is undefined.');
            return res.redirect('/admin/adminprofile'); 
        }

        const user = await User.findById(user_id);
        if (!user) {
            console.log(`User with ID ${user_id} not found.`);
            return res.redirect('/admin/adminprofile'); 
        }

        user.isBlocked = true;
        await user.save();

        return res.redirect('/admin/adminprofile');
    } catch (error) {
        console.error('Block user error', error);
        return res.redirect('/admin/adminprofile');
    }
}

const unblockUser = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        if (!user_id) {
            console.log('User ID is undefined.');
            return res.redirect('/admin/adminprofile'); 
        }

        const user = await User.findById(user_id);
        if (!user) {
            console.log(`User with ID ${user_id} not found.`);
            return res.redirect('/admin/adminprofile'); 
        }

        user.isBlocked = false;
        await user.save();

        return res.redirect('/admin/adminprofile');
    } catch (error) {
        console.error('Unblock user error', error);
        return res.redirect('/admin/adminprofile');
    }
}

module.exports ={
    loadAdminProfile,
    blockUser,
    unblockUser
}