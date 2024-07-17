const loadproducts = async (req,res)=>{

    try {
        res.render('products', { successMessage:'',errorMessage:''});
    } catch (error) {
        console.error('Error loading login page:', error);
        res.render('products', {successMessage:'', errorMessage: "An error occurred" });
    }
};
 module.exports ={
    loadproducts
}