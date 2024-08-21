const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const TransactionSchema = new Schema({
    amount: { 
        type: Number, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['credit', 'debit'], 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'completed', 'failed'], 
        default: 'pending' 
    },
    orderId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Order' 
    },
    description: { 
        type: String, 
        default: '' 
    },
   
},{timestamps:true});

const WalletSchema = new Schema({
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    balance: { 
        type: Number, 
        default: 0 
    },
    transactions: [TransactionSchema]
}, {
    timestamps: true
});

WalletSchema.methods.calculateTotalBalance = function() {
    let total = this.balance;
    this.transactions.forEach(transaction => {
      if (transaction.type === 'credit') {
        total += transaction.amount;
      } else if (transaction.type === 'debit') {
        total -= transaction.amount;
      }
    });
    return total;
  };
  
  WalletSchema.methods.getFormattedBalance = function() {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(this.calculateTotalBalance());
  };

WalletSchema.set('toJSON', { virtuals: true });
WalletSchema.set('toObject', { virtuals: true });

const Wallet = mongoose.model('Wallet', WalletSchema);

module.exports = Wallet;
