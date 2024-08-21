const User =require('../../models/userModel')

const loadAdminProfile =async (req,res)=>{
    try {
        const admin = await User.findById(req.session.user_id); 

        return res.render('adminProfle', { admin,successMessage:'',errorMessage:''});
    } catch (error) {
        const admin = await User.findById(req.session.user_id)
        console.log('Error loading user details',error);
        return res.render('adminProfle',{admin,successMessage:'', errorMessage: "An error occurred while rendering user detials" })
    }
}

const showUser= async (req,res)=>{
try {
    const users = await User.find({isAdmin:false})
     return res.render('userlist', { users,successMessage:'',errorMessage:''});
} catch (error) {
    console.log("user showing error",error);
    return res.render('adminDash',{admin,successMessage:'', errorMessage: "An error occurred while rendering user detials" })
}
}

const updateAdmin = async (req, res) => {
    const { firstName, lastName,/* email, phone,*/ newPassword, confirmPassword } = req.body;

    try {
        const admin = await User.findById(req.session.user_id);
       
        if (!admin) {
            return res.render('adminProfle', { admin, successMessage: '', errorMessage: "User not found" });
        }

        admin.firstName = firstName || admin.firstName;
        admin.lastName = lastName || admin.lastName;
        // admin.email = email || admin.email;
        // admin.phone = phone || admin.phone;

        if (newPassword && confirmPassword && newPassword === confirmPassword) {
            admin.password = confirmPassword || admin.password;
        }

        await admin.save();

        req.session.user = admin;
        return res.redirect('/admin/adminprofile');
    } catch (error) {
        console.log('Error while updating admin', error);
        return res.render('adminProfle', { admin: req.body, successMessage: '', errorMessage: "Error updating admin" });
    }
};

const blockUser = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        if (!user_id) {
            console.log('User ID is undefined.');
            return res.redirect('/admin/show-users'); 
        }

        const user = await User.findById(user_id);
        if (!user) {
            console.log(`User with ID ${user_id} not found.`);
            return res.redirect('/admin/show-users'); 
        }

        user.isBlocked = true;
        await user.save();

        return res.redirect('/admin/show-users');
    } catch (error) {
        console.error('Block user error', error);
        return res.redirect('/admin/show-users');
    }
}

const unblockUser = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        if (!user_id) {
            console.log('User ID is undefined.');
            return res.redirect('/admin/show-users'); 
        }

        const user = await User.findById(user_id);
        if (!user) {
            console.log(`User with ID ${user_id} not found.`);
            return res.redirect('/admin/show-users'); 
        }

        user.isBlocked = false;
        await user.save();

        return res.redirect('/admin/show-users');
    } catch (error) {
        console.error('Unblock user error', error);
        return res.redirect('/admin/show-users');
    }
}

module.exports ={
    loadAdminProfile,
    showUser,
    updateAdmin,
    blockUser,
    unblockUser
}