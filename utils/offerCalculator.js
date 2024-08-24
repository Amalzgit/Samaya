const {ProductOffer} = require('../models/offerSchema');


const calculateOfferDiscount = async (productId) =>{
    const now =new Date();
    const offers = await ProductOffer.find({
        productId,
        isActive :true,
        endDate :{$gte:now}
    })
    return offers.length > 0 ? Math.max(...offers.map(offer => offer.discount)) : null;
};
const calculatefinalPrice =(price,discount)=>{
    return discount > 0 ? price - (price *(discount /100)) : price
}


module.exports = {
calculateOfferDiscount,
calculatefinalPrice
}