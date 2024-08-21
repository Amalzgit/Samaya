require('dotenv').config();

const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_ID_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY
});

const createOrder = async (amount, currency = 'INR', receipt) => {
  try {
    const options = {
      amount: parseInt(amount),
      currency,
      receipt,
      payment_capture: 1
    };
    return await razorpay.orders.create(options);
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};



const verifyPaymentSignature =(orderId ,paymentId,signature) =>{
    const secret =process.env.RAZORPAY_SECRET_KEY;
    const  generatedsignature =crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
    return generatedsignature === signature;
};
module.exports = {
    createOrder,
    verifyPaymentSignature
  };