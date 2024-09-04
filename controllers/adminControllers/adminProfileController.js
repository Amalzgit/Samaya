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


const showUser = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = 5;
        const skip = (page - 1) * limit;

        const [totalUsers, users] = await Promise.all([
            User.countDocuments({ isAdmin: false }),
            User.find({ isAdmin: false })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
        ]);

        const totalPages = Math.ceil(totalUsers / limit);

        const pagination = {
            currentPage: page,
            totalPages: totalPages,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            prevPageUrl: page > 1 ? `/admin/show-users?page=${page - 1}` : null,
            nextPageUrl: page < totalPages ? `/admin/show-users?page=${page + 1}` : null,
            pageUrls: Array.from({ length: totalPages }, (_, i) => `/admin/show-users?page=${i + 1}`)
        };

        return res.render('userlist', { 
            users, 
            pagination, 
            successMessage: req.flash('success'),
            errorMessage: req.flash('error')
        });
    } catch (error) {
        console.error("Error in showUser function:", error);
        req.flash('error', "An error occurred while fetching user details");
        return res.redirect('/admin/dashboard');
    }
};



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