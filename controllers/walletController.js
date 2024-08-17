const Wallet = require('../models/walletModel');
const Order  = require('../models/orderModel');

const addFunds =async (req,res) =>{
    try {
        const { amount } = req.body;
        const wallet = await Wallet.findOne({ user:req.currentUser._id});
        
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        wallet.transactions.push({
            amount,
            type: 'credit',
            status: 'completed'
        });

        wallet.balance += amount;
        await wallet.save();

        res.json({ message: 'Funds added successfully', wallet });
    } catch (error) {
        res.status(500).json({ message: 'Error adding funds', error: error.message });
    }
};
const withdrawFunds = async(req,res)=>{
    try {
    const { amount } = req.body;
    const wallet = await Wallet.findOne({ user:req.currentUser._id });
    
    if (!wallet) {
        return res.status(404).json({ message: 'Wallet not found' });
    }

    if (wallet.balance < amount) {
        return res.status(400).json({ message: 'Insufficient funds' });
    }

    wallet.transactions.push({
        amount,
        type: 'debit',
        status: 'completed'
    });

    wallet.balance -= amount;
    await wallet.save();

    res.json({ message: 'Funds withdrawn successfully', wallet });
} catch (error) {
    res.status(500).json({ message: 'Error withdrawing funds', error: error.message });
}
};