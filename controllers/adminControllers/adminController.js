
const loadAdminHome = async (req, res) => {
    try {        
        res.render('adminDash');
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
        res.render('adminDash', { message: "An error occurred" });
    }
};

module.exports = {
    loadAdminHome
};
