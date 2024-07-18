const loadShop = async (req,res)=>{

    try {
       return res.render('shop', { successMessage:'',errorMessage:''});
    } catch (error) {
        console.error('Error loading login page:', error);
      return  res.render('shop', {successMessage:'', errorMessage: "An error occurred" });
    }
};
 module.exports ={
    loadShop
}