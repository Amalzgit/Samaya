const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Transaction Schema as an embedded schema within Wallet
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
        default: 'pending' // Ensure this is a valid string value and not another type
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

// Virtual to calculate the total balance
WalletSchema.virtual('totalBalance').get(function() {
    let total = this.balance;
    this.transactions.forEach(transaction => {
        if (transaction.type === 'credit') {
            total += transaction.amount;
        } else if (transaction.type === 'debit') {
            total -= transaction.amount;
        }
    });
    return total;
});

WalletSchema.virtual('formattedBalance').get(function() {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(this.totalBalance);
});

WalletSchema.set('toJSON', { virtuals: true });
WalletSchema.set('toObject', { virtuals: true });

const Wallet = mongoose.model('Wallet', WalletSchema);

module.exports = Wallet;
