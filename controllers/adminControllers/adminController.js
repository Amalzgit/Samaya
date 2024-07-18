
const loadAdminHome = async (req, res) => {
    try {        
       return res.render('adminDash');
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
       return res.render('adminDash', { message: "An error occurred" });
    }
};

module.exports = {
    loadAdminHome
};
