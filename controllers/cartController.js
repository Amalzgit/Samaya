const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Address = require("../models/addressModel");
const Coupon = require("../models/CouponModel");
const {
  calculateOfferDiscount,
  calculatefinalPrice,
} = require("../utils/offerCalculator");
const { formatCurrency } = require("../utils/currencyFormatter");

const loadCart = async (req, res) => {
  try {
    const Id = req.currentUser?._id;
    const usedCoupons = req.currentUser.usedCoupons;
    // console.log(usedCoupons);
    // console.log(Id);

    const [cart, coupons] = await Promise.all([
      Cart.findOne({ user: Id })
        .populate("items.product")
        .populate("appliedCoupon"),
      Coupon.find({ isActive: true }),
    ]);
    if (!cart) {
       cart = new Cart({ user: Id, items: [], appliedCoupon:null});
      await cart.save();
      return res.json({ cart: cart, coupons });
    }

    const cartItems = await Promise.all(
      cart.items.map(async (item) => {
        const discount = await calculateOfferDiscount(item.product._id);
        if (discount) {
          const offerPrice = calculatefinalPrice(item.product.price, discount);
          return {
            ...item.toObject(),
            product: {
              ...item.product.toObject(),
              originalPrice: item.product.price,
              price: offerPrice,
              hasOffer: true,
              discountPercentage: discount,
            },
          };
        }

        return {
          ...item.toObject(),
          product: {
            ...item.product.toObject(),
            hasOffer: false,
          },
        };
      })
    );

    const availableCoupons = coupons.filter(
      (coupon) => !usedCoupons.includes(coupon._id.toString())
    );

    let totalPrice = 0;

    if (cartItems.length > 0) {
      totalPrice = cartItems.reduce((accumulator, item) => {
        return accumulator + item.product.price * item.quantity;
      }, 0);
    }

    const formattedTotalPrice = formatCurrency(totalPrice);
    const discountAmount = (totalPrice * cart.discount) / 100;
    const discountedTotal = totalPrice - discountAmount;
    const formattedDiscountedTotal = formatCurrency(discountedTotal);

    return res.render("cart", {
      cart: {
        ...cart.toObject(),
        items: cartItems,
        totalPrice,
        formattedTotalPrice,
        discountAmount,
        discountedTotal,
        formattedDiscountedTotal,
      },
      coupons: availableCoupons,
    });
  } catch (error) {
    console.log("cart loading error :", error);
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
    let cart = await Cart.findOneAndUpdate(
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
        // Check if the coupon should be removed based on min/max amount
        if (checkCouponRemoval(cart.appliedCoupon, cart.total)) {
          cart = await handleCouponRemoval(cart);
        }
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
      couponRemoved: cart.appliedCoupon === null,
    });
  } catch (error) {
    console.log("Update cart error:", error);
    res.status(500).json({ message: "Error updating cart", error });
  }
};

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
    const usedCoupons = req.currentUser.usedCoupons;

    // Fetch cart data and user addresses concurrently
    const [cart, coupons, userAddress] = await Promise.all([
      Cart.findOne({ user: userId })
        .populate("items.product")
        .populate("appliedCoupon"),
      Coupon.find({ isActive: true }),
      Address.find({ user: userId }),
    ]);

    // Process cart items and calculate offers
    const cartItems = await Promise.all(
      cart.items.map(async (item) => {
        const discount = await calculateOfferDiscount(item.product._id);
        if (discount) {
          const offerPrice = calculatefinalPrice(item.product.price, discount);
          return {
            ...item.toObject(),
            product: {
              ...item.product.toObject(),
              originalPrice: item.product.price,
              price: offerPrice,
              hasOffer: true,
              discountPercentage: discount,
            },
          };
        }

        return {
          ...item.toObject(),
          product: {
            ...item.product.toObject(),
            hasOffer: false,
          },
        };
      })
    );
    // console.log(cartItems, "=>cart items");

    // Calculate total price and apply discounts
    let totalPrice = 0;
    if (cartItems.length > 0) {
      totalPrice = cartItems.reduce((accumulator, item) => {
        return accumulator + item.product.price * item.quantity;
      }, 0);
    }

    const formattedTotalPrice = formatCurrency(totalPrice);
    const discountAmount = (totalPrice * cart.discount) / 100;
    const discountedTotal = totalPrice - discountAmount;
    const formattedDiscountedTotal = formatCurrency(discountedTotal);

    // Determine the selected address, defaulting to the first address if none is default
    const selectedAddress =
      userAddress.find((address) => address.isDefault) || userAddress[0];

    // Filter available coupons
    const availableCoupons = coupons.filter(
      (coupon) => !usedCoupons.includes(coupon._id.toString())
    );

    // Render the checkout page with the fetched data
    res.render("checkout", {
      cart: {
        ...cart.toObject(),
        items: cartItems,
        totalPrice,
        formattedTotalPrice,
        discountAmount,
        discountedTotal,
        formattedDiscountedTotal,
      },
      addresses: userAddress,
      user: req.currentUser,
      selectedAddress,
      coupons: availableCoupons,
      layout: false,
      errorMessage: "",
    });
  } catch (error) {
    console.error("Error in getCheckout:", error);
    res
      .status(500)
      .json({
        message: "An error occurred while processing your request.",
        error,
      });
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
    const usedCoupons = req.currentUser.usedCoupons;

    // Find the user's cart
    let cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Calculate cart total
    const cartTotal = calculateCartTotal(cart);

    // Check if there's an existing coupon that needs to be removed
    if (cart.appliedCoupon) {
      const existingCoupon = await Coupon.findById(cart.appliedCoupon);
      if (existingCoupon && checkCouponRemoval(existingCoupon, cartTotal)) {
        cart = await handleCouponRemoval(cart);
        return res.json({
          success: true,
          message: "Existing coupon removed due to cart total change",
          cart: formatCartResponse(cart),
        });
      }
    }

    // If no new coupon code is provided, just return the current cart state
    if (!couponCode) {
      return res.json({
        success: true,
        message: "No changes to cart",
        cart: formatCartResponse(cart),
      });
    }

    // Find the new coupon
    const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
    if (!coupon) {
      return res.status(400).json({ message: "Invalid or inactive coupon" });
    }
    if (usedCoupons.includes(coupon._id.toString())) {
      return res.status(400).json({ message: "Coupon already used once" });
    }

    // Validate the coupon
    const validationResult = coupon.validateCoupon(cartTotal);
    if (!validationResult.valid) {
      return res.status(400).json({ message: validationResult.message });
    }

    // Apply the new coupon
    cart.appliedCoupon = coupon._id;
    cart.discount = coupon.discount;
    await cart.save();

    res.json({
      success: true,
      message: "Coupon applied successfully",
      cart: formatCartResponse(cart),
      coupon,
    });
  } catch (error) {
    console.error("Apply coupon error:", error);
    res
      .status(500)
      .json({ message: "Error applying coupon", error: error.message });
  }
};

const checkCouponRemoval = (coupon, cartTotal) => {
  return (
    (coupon.maxAmount && cartTotal > coupon.maxAmount) ||
    (coupon.minAmount && cartTotal < coupon.minAmount)
  );
};

const handleCouponRemoval = async (cart) => {
  cart.appliedCoupon = null;
  cart.discount = 0;
  return await cart.save();
};

// Helper functions remain the same
const calculateCartTotal = (cart) => {
  return cart.items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
};

const formatCartResponse = (cart) => {
  return {
    items: cart.items.map((item) => {
      if (!item.product) {
        console.error('Item product is undefined:', item);
        return null; // or handle the case where item.product is not available
      }

      return {
        productId: item.product._id,
        name: item.product.name,
        price: item.product.price, // Fixed from `cart.constructor.item.product.price`
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity, // Fixed from `cart.constructor.item.product.price * item.quantity`
      };
    }).filter(item => item !== null), // Filter out any items that are null
    total: cart.formattedTotalPrice,
    discountAmount: cart.discountAmount, // Fixed from `cart.constructor.cart.discountAmount`
    discountedTotal: cart.formattedDiscountedTotal,
    appliedCoupon: cart.appliedCoupon
      ? {
          code: cart.appliedCoupon.code,
          discount: cart.appliedCoupon.discount,
        }
      : null,
  };
};

const removeCoupon = async (req, res) => {
  try {
    const userId = req.currentUser._id;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const cartTotal = calculateCartTotal(cart);

    cart.appliedCoupon = null;
    cart.discountAmount = 0;
    cart.discountedTotal = cartTotal;

    await cart.save();

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