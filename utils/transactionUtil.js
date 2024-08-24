const mongoose = require("mongoose");
const Transaction = require("../models/transactions");
const { Types } = mongoose;

const storeTransaction = async (transactionDetails) => {
  try {
    const transaction = new Transaction({
      user: transactionDetails.userId, 
      type: transactionDetails.type,
      amount: transactionDetails.amount,
      description: transactionDetails.description,
      order: transactionDetails.orderId
        ? new Types.ObjectId(transactionDetails.orderId)
        : null,
      paymentMethod: transactionDetails.paymentMethod,
      transactionNumber: transactionDetails.transactionNumber,
    });
    await transaction.save();
  } catch (error) {
    console.error("Error storing transaction", error);
  }
};
module.exports = {
  storeTransaction,
};
