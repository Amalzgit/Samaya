const getReview = async(req,res)=>{

try {
    return res.render('reviews')

} catch (error) {
    console.log(error);
}}
module.exports={
    getReview
}