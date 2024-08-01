const User = require("../models/userModel");
const Address = require("../models/addressModel");

const loadUserDetails = async (req, res) => {
  try {
    const [user, addresses] = await Promise.all([
      User.findById(req.session.user_id),
      Address.find()
    ]);

    return res.render("userDetails", {
      user,
      addresses,
      successMessage: "",
      errorMessage: "",
    });
  } catch (error) {
    console.error("Error loading user details:", error);
    return res.render("userDetails", {
      user: null,
      addresses: [],
      successMessage: "",
      errorMessage: "An error occurred while rendering user details",
    });
  }
};

const updateUser = async (req, res) => {
  const { firstName, lastName, email, phone, newPassword, confirmPassword } = req.body;

  try {
    const user = await User.findById(req.session.user_id);
    if (!user) {
      return res.render("userDetails", {
        user: null,
        successMessage: "",
        errorMessage: "User not found",
      });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.phone = phone || user.phone;

    if (newPassword && confirmPassword && newPassword === confirmPassword) {
      user.password = newPassword; // Use newPassword directly
    }

    await user.save();
    req.session.user = user;
    return res.redirect("/user-details");
  } catch (error) {
    console.error("Error while updating user:", error);
    return res.render("userDetails", {
      user: req.body,
      successMessage: "",
      errorMessage: "Error updating user",
    });
  }
};

const loadAddAddress = async (req, res) => {
  try {
    return res.render("addAddress", { layout: false });
  } catch (error) {
    console.error("Error while rendering add address page:", error);
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
    const isDefaultBoolean = isDefault === "on";
    const userId = req.session.user_id;

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
    return res.redirect('/user-details');
  } catch (error) {
    console.error("Error while adding address:", error);
  }
};

const loadEditAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const address = await Address.findById(addressId);
    const user = await User.findById(req.session.user_id);
    // console.log("address id:",addressId);
    // console.log("address :",address);
    // console.log("user:",user);

    res.render('edit-address', {user, address, layout: false });
  } catch (error) {
    console.error('Error loading edit address:', error);
    res.redirect('/user-details');
  }
};

const editAddress = async (req,res)=>{
  try {
        const{country,
          fullName,
          mobileNumber,
          pincode,
          addressLine1,
          addressLine2,
          landmark,
          townCity,
          state,
          type,
          isDefault}=req.body;

          const { addressId } = req.params;
          
          await Address.findByIdAndUpdate(addressId,{
            fullName:fullName || fullName,
          mobileNumber:mobileNumber || mobileNumber,
          pincode:pincode ||pincode,
          addressLine1:addressLine1 ||addressLine1,
          addressLine2:addressLine2 ||addressLine2,
          landmark:landmark ||landmark,
          townCity:townCity ||townCity,
          state :state || state,
          type :type ||type,
          isDefault:isDefault || isDefault
          })
          return res.redirect('/user-details');
    
  } catch (error) {
    console.log('edit address error',error);
    res.redirect('/edit-address/:addressId');
  }

}

const deleteAddress= async (req,res)=>{
  try {
   const {addressId} =req.params;
   await Address.findByIdAndDelete(addressId);

   return res.redirect('/user-details')

  } catch (error) {
   console.log("remove Address error",error);
   return res.redirect('/user-details')
  }

}

module.exports = {
  loadUserDetails,
  updateUser,
  loadAddAddress,
  addAddress,
  loadEditAddress,
  editAddress,
  deleteAddress
};
