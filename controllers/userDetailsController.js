const Address = require("../models/addressModel");
const Order =require('../models/orderModel')
const Wallet =require('../models/walletModel');
const loadUserDetails = async (req, res) => {
  try {
    
    const user = req.currentUser

    const [addresses, orders, wallet] = await Promise.all([
      Address.find({ user: req.currentUser._id }),
      Order.find({user:user })
            .populate('items.product')     
            .sort({createdAt: -1}),
      Wallet.findOne({user:user._id}).populate('transactions.orderId')
    ])
    

    
    res.render("userDetails", {
      orders,
      user,
      addresses,
      wallet,
      successMessage: "",
      errorMessage: "",
    });
  } catch (error) {
    console.error("Error loading user details:", error);
    res.status(500).json({ success: false, message: "An error occurred while loading user details" });
  }
};

const updateUser = async (req, res) => {
  const { firstName, lastName, newPassword, confirmPassword } = req.body;

  try {
    const user =req.currentUser
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;

    if (newPassword && confirmPassword && newPassword === confirmPassword) {
      user.password = confirmPassword;
    }

    await user.save();
    req.currentUser = user; // Update session with new user data
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const loadAddAddress = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.currentUser._id });
    res.render("addAddress", { layout: false, addresses });
  } catch (error) {
    console.error("Error loading add address page:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const addAddress = async (req, res) => {
  const {
    country,
    fullName,
    mobileNumber,
    pincode,
    addressLine1,
    addressLine2,
    landmark,
    townCity,
    state,
    type,
    isDefault
  } = req.body;

  try {
    const userId = req.session.user_id;
    
    if (!userId) {
      console.error("User ID is missing in session.");
      return res.status(400).json({ success: false, message: "User ID is missing" });
    }

    const isDefaultBoolean = isDefault === "on";

    if (isDefaultBoolean) {
      await Address.updateMany(
        { user: userId, isDefault: true },
        { isDefault: false }
      );
    }

    const newAddress = new Address({
      country,
      fullName,
      mobileNumber,
      pincode,
      addressLine1,
      addressLine2,
      landmark,
      townCity,
      state,
      type,
      isDefault: isDefaultBoolean,
      user: userId
    });

    await newAddress.save();
    res.redirect('/user-details')
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const loadEditAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const address = await Address.findById(addressId);
    const user = req.currentUser

    if (!address || !user) {
      return res.status(404).json({ success: false, message: "Address or user not found" });
    }

    res.render('edit-address', { user, address, layout: false });
  } catch (error) {
    console.error('Error loading edit address:', error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const editAddress = async (req, res) => {
  const { addressId } = req.params;
  const {
    country,
    fullName,
    mobileNumber,
    pincode,
    addressLine1,
    addressLine2,
    landmark,
    townCity,
    state,
    type,
    isDefault
  } = req.body;

  try {
    const [addressToUpdate, currentDefaultAddress] = await Promise.all([
      Address.findById(addressId),
      Address.findOne({ isDefault: true })
    ]);

    if (!addressToUpdate) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    if (isDefault === 'on' && currentDefaultAddress && currentDefaultAddress._id.toString() !== addressId) {
      await Address.findByIdAndUpdate(currentDefaultAddress._id, { isDefault: false });
    }


    const updateData = {
      country: country || addressToUpdate.country,
      fullName: fullName || addressToUpdate.fullName,
      mobileNumber: mobileNumber || addressToUpdate.mobileNumber,
      pincode: pincode || addressToUpdate.pincode,
      addressLine1: addressLine1 || addressToUpdate.addressLine1,
      addressLine2: addressLine2 || addressToUpdate.addressLine2,
      landmark: landmark || addressToUpdate.landmark,
      townCity: townCity || addressToUpdate.townCity,
      state: state || addressToUpdate.state,
      type: type || addressToUpdate.type,
      isDefault: isDefault === "on"
    };

    const address = await Address.findByIdAndUpdate(addressId, updateData, { new: true });

    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    res.redirect('/user-details')
  } catch (error) {
    console.error('Error editing address:', error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const result = await Address.findByIdAndDelete(addressId);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getWalletDetails = async (req, res) => {
  try {
    const userId = req.currentUser._id;

    let wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      wallet = new Wallet({ user: userId, balance: 0, transactions: [] });
      await wallet.save();
    }

    const totalBalance = wallet.calculateTotalBalance();

    const sortedTransactions = wallet.transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    // console.log(sortedTransactions);
    

    res.json({
      formattedBalance: totalBalance,
      totalBalance: wallet.balance,
      transactions: sortedTransactions
    });
  } catch (error) {
    console.error('Error fetching wallet details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



module.exports = {
  loadUserDetails,
  updateUser,
  loadAddAddress,
  addAddress,
  loadEditAddress,
  editAddress,
  deleteAddress,
  getWalletDetails
};
