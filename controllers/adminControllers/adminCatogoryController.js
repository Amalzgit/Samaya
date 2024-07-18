const category = require('../../models/catogaryModel');

const categoryView = async (req, res) => {
    try {
        return res.render('Categories');
        
    } catch (error) {
        
    }
}

module.exports ={
    categoryView
}