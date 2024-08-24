const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");
const Coupon = require("../models/CouponModel");

const loadCart = async (req, res) => {
  try {
    const Id = req.currentUser._id;

    const [cart, coupons] = await Promise.all([
      Cart.findOne({ user: Id }).populate("items.product")
      .populate("appliedCoupon"),
      Coupon.find({ isActive: true }),
    ]);
    return res.render("cart", { cart, coupons });
  } catch (error) {
    console.log("cart loading error :", error);
    res.status(500).json({ message: "Error finidng cart", error });
  }
};

const addItemToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.currentUser._id;

    const [cart, product] = await Promise.all([
      Cart.findOne({ user: userId }),
      Product.findById(productId),
    ]);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: "Not enough stock" });
    }

    if (!cart) {
      const newCart = new Cart({
        user: userId,
        items: [{ product: productId, quantity }],
        total: product.price * quantity,
      });
      await newCart.save();
    } else {
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      );
      if (existingItem) {
        existingItem.quantity += parseInt(quantity);
      } else {
        cart.items.push({ product: productId, quantity });
      }
      cart.total = cart.items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      );
      await cart.save();
    }
    res.redirect("/cart");
  } catch (error) {
    console.log("adding to cart error :", error);

    res.status(500).json({ message: "Error adding to cart", error });
  }
};

const removeItemFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const cart = await Cart.findOne({ user: req.currentUser._id });
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );
    cart.total = cart.items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
    await cart.save();
    res.redirect("/cart");
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Error removing from cart", error });
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.currentUser._id });
    cart.items = [];
    cart.total = 0;
    await cart.save();
    res.redirect("/cart");
  } catch (error) {
    console.log("clear cart error :", error);
    res.status(500).json({ message: "Error clearing cart", error });
  }
};

const updateCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Find the cart for the current user
    const cart = await Cart.findOneAndUpdate(
      { user: req.currentUser._id, "items.product": productId },
      { $set: { "items.$.quantity": quantity } },
      { new: true }
    )
      .populate("items.product")
      .populate("appliedCoupon");

    cart.total = cart.items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
    if (cart.appliedCoupon) {
      console.log("Coupon:", cart.appliedCoupon);
      const validationResult = cart.appliedCoupon.validateCoupon(cart.total);
      console.log("Coupon Validation Result:", validationResult);

      if (validationResult.valid) {
        cart.discountAmount = (cart.total * cart.appliedCoupon.discount) / 100;
        cart.discountedTotal = cart.total - cart.discountAmount;
      } else {
        cart.appliedCoupon = null;
        cart.discountAmount = 0;
        cart.discountedTotal = cart.total;
      }
    } else {
      cart.discountedTotal = cart.total;
    }
    // Save the updated cart
    await cart.save();

    const formatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    });

    const formattedSubtotal = formatter.format(
      (parseFloat(
        cart.items.find((item) => item.product._id.toString() === productId)
          ?.product.price
      ) || 0) * quantity
    );
    const formattedTotal = formatter.format(cart.total);
    const formattedDiscountedTotal = formatter.format(cart.discountedTotal);
    res.json({
      success: true,
      formattedSubtotal,
      formattedTotal,
      formattedDiscountedTotal,
      cartSubtotal: formattedTotal,
      cartDiscountedTotal: formattedDiscountedTotal,
    });
  } catch (error) {
    console.log("Update cart error:", error);
    res.status(500).json({ message: "Error updating cart", error });
  }
};

// checkout

const Checkout = async (req, res) => {
  try {
    const cartData = JSON.parse(req.body.cartData);

    req.session.CheckoutCart = cartData;

    res.redirect("/checkout-page");
  } catch (error) {
    console.log("checkout error:", error);
    res.redirect("/cart");
  }
};
const getCheckout = async (req, res) => {
  try {
    const userId = req.currentUser._id;
    const cartData = req.session.CheckoutCart;
    const [userAddress, user] = await Promise.all([
      Address.find({ user: userId }),
      req.currentUser,
    ]);
    const selectedAddress =
      userAddress.find((address) => address.isDefault) || userAddress[0];

    res.render("checkout", {
      cart: cartData,
      addresses: userAddress,
      user,
      selectedAddress,
      layout: false,
    });
  } catch (error) {
    console.log("Error in getCheckout:", error);
    res.status(500).send("An error occurred while processing your request.");
  }
};

const changeAddress = async (req, res) => {
  try {
    const { addressId } = req.body;
    req.session.selectedAddressId = addressId;
    res.sendStatus(200);
  } catch (error) {
    console.log("change address :", error);
  }
};

const loadAddAddress = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.currentUser._id });
    res.render("checkoutAddAddress", { layout: false, addresses });
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
    isDefault,
  } = req.body;

  try {
    const userId = req.currentUser._id;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is missing" });
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
      user: userId,
    });

    const savedAddress = await newAddress.save();
    if (!savedAddress) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to save address" });
    }
    res.redirect("/checkout-page");
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
const applyCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;
    const userId = req.currentUser._id;

    // Find the coupon
    const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
    if (!coupon) {
      return res.status(400).json({ message: "Invalid or inactive coupon" });
    }

    // Find the user's cart
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
console.log(cart,"=> cart before discount");

    // Calculate cart total
    const cartTotal = calculateCartTotal(cart);
    
    // Validate the coupon
    const validationResult = coupon.validateCoupon(cartTotal);
    if (!validationResult.valid) {
      return res.status(400).json({ message: validationResult.message });
    }

    // Calculate discount
    const discountAmount = (cartTotal * coupon.discount) / 100;
    const discountedTotal = cartTotal - discountAmount;

    // Update cart
    cart.appliedCoupon = coupon;
    cart.discountAmount = discountAmount;
    cart.discountedTotal = discountedTotal;

    await cart.save();
    console.log(cart,"=> cart aftr discount");

    res.json({
      success: true,
      message: "Coupon applied successfully",
      cart: formatCartResponse(cart),
      coupon
    });
  } catch (error) {
    console.error("Apply coupon error:", error);
    res.status(500).json({ message: "Error applying coupon", error });
  }
};

// Helper function to calculate cart total
const calculateCartTotal = (cart) => {
  return cart.items.reduce((total, item) => total + item.product.price * item.quantity, 0);
};

// Helper function to format cart response
const formatCartResponse = (cart) => {
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });

  const cartTotal = calculateCartTotal(cart);
  const discountedTotal = cart.discountedTotal || cartTotal;

  return {
    items: cart.items.map(item => ({
      productId: item.product._id,
      name: item.product.name,
      price: formatter.format(item.product.price),
      quantity: item.quantity,
      subtotal: formatter.format(item.product.price * item.quantity),
    })),
    total: formatter.format(cartTotal),
    discountAmount: formatter.format(cart.discountAmount || 0),
    discountedTotal: formatter.format(discountedTotal),
    appliedCoupon: cart.appliedCoupon ? {
      code: cart.appliedCoupon.code,
      discount: cart.appliedCoupon.discount,
    } : null,
  };
};
const removeCoupon = async (req, res) => {
  try {
    const userId = req.currentUser._id;

    // Find the user's cart
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    console.log(cart,"=> cart before remove");

    // Calculate the cart total without any discount
    const cartTotal = calculateCartTotal(cart);

    // Remove the applied coupon and reset discounts
    cart.appliedCoupon = null;
    cart.discountAmount = 0;
    cart.discountedTotal = cartTotal; // Reset to original total without discount

    // Save the updated cart
    await cart.save();
    console.log(cart,"=> cart aftr remove");

    res.json({
      success: true,
      message: "Coupon removed successfully",
      cart: formatCartResponse(cart),
    });
  } catch (error) {
    console.error("Remove coupon error:", error);
    res.status(500).json({ message: "Error removing coupon", error });
  }
};


module.exports = {
  addItemToCart,
  loadCart,
  removeItemFromCart,
  clearCart,
  updateCart,
  loadAddAddress,
  addAddress,

  applyCoupon,
  removeCoupon,

  // checkout
  Checkout,
  getCheckout,
  changeAddress,
};
