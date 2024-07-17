const loadShop = async (req,res)=>{

    try {
        res.render('shop', { successMessage:'',errorMessage:''});
    } catch (error) {
        console.error('Error loading login page:', error);
        res.render('shop', {successMessage:'', errorMessage: "An error occurred" });
    }
};
 module.exports ={
    loadShop
}