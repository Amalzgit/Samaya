const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const transactionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['CREDIT', 'DEBIT'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  order: { type: Schema.Types.ObjectId, ref: 'Order' },
  paymentMethod: { type: String, enum: ['Cash on Delivery', 'Credit Card', 'Debit Card','Wallet', 'razorpay'] },
  paymentId: { type: String, default: null }, 
  transactionNumber: { type: String, unique: true, required: true }, 
}, {
  timestamps: true
});

transactionSchema.pre('save', async function (next) {
  const transaction = this;

  if (!transaction.isNew) {
    return next();
  }

  const generateTransactionNumber = async () => {
    const reference = 'TXN-' + Date.now() + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const existingTransaction = await Transaction.findOne({ transactionNumber: reference });
    if (existingTransaction) {
      return generateTransactionNumber();
    }
    return reference;
  };

  try {
    transaction.transactionNumber = await generateTransactionNumber();
    next();
  } catch (error) {
    next(error);
  }
});

const Transaction = model('Transaction', transactionSchema);

module.exports = Transaction;
