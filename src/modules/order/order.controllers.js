import axios from "axios";

import Cart from "../../../database/models/cart.model.js";
import Order from "../../../database/models/order.model.js";
import { messages } from "../../utils/constant/messages.js";
import { AppError, catchAsyncError } from "../../utils/catch-error.js";
import Coupon from "../../../database/models/coupon.model.js";
import { couponTypes, orderStatus } from "../../utils/constant/enums.js";

export const createOrder = catchAsyncError(async (req, res, next) => {
  const { fullName, address, phone, couponCode } = req.body;
  const userId = req.authUser._id;
  let cart = await Cart.findOne({ user: userId }).populate(
    "products.productId"
  );
  if (!cart) {
    cart = await Cart.create({ user: userId, products: [], totalPrice: 0 });
  }

  if (!cart.products.length)
    return next(new AppError(messages.cart.empty, 404));

  let orderProducts = [];
  let orderPrice = 0;

  for (const item of cart.products) {
    const product = item.productId;

    if (!product.instock(item.quantity))
      return next(new AppError(messages.product.outStock, 400));

    const productFinal = product.finalPrice * item.quantity;

    orderProducts.push({
      productId: product._id,
      title: product.title,
      price: product.price,
      quantity: item.quantity,
      discount: product.discount,
      finalPrice: productFinal,
    });

    orderPrice += productFinal;
  }

  let finalPrice = orderPrice;
  let appliedCoupon = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode });
    if (!coupon) return next(new AppError(messages.coupon.notFound, 404));

    const now = Date.now();
    if (coupon.fromDate > now)
      return next(new AppError("Coupon has not started yet", 400));
    if (coupon.expire < now)
      return next(new AppError("Coupon has expired", 400));

    appliedCoupon = coupon._id;

    if (coupon.type === couponTypes.PERCENTAGE) {
      finalPrice = orderPrice - (orderPrice * coupon.discount) / 100;
    } else if (coupon.type === couponTypes.FIXED) {
      finalPrice = Math.max(0, orderPrice - coupon.discount);
    }
  }

  const order = await Order.create({
    fullName,
    user: userId,
    products: orderProducts,
    address,
    phone,
    orderPrice,
    finalPrice,
  });

  await Cart.findOneAndDelete({ user: userId });

  res.status(201).json({
    message: messages.order.createdSuccessfully,
    success: true,
    data: order,
  });
});

export const getUserOrders = catchAsyncError(async (req, res, next) => {
  const userId = req.authUser._id;
  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

  return res.status(200).json({
    message: messages.SUCCESS,
    results: orders.length,
    data: orders,
  });
});

export const getOrderDetails = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findOne({
    _id: id,
  }).populate("products.productId");

  if (!order) return next(new AppError(messages.order.notFound, 404));

  return res.status(200).json({
    message: messages.SUCCESS,
    data: order,
  });
});

export const updateOrderStatus = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = Object.values(orderStatus);
  if (!validStatuses.includes(status))
    return next(new AppError("Invalid order status", 400));

  const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

  if (!order) return next(new AppError(messages.NOT_FOUND, 404));

  return res.status(200).json({
    message: "Order status updated successfully",
    data: order,
  });
});

export const softDeleteOrder = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findOneAndUpdate(
    { _id: id },
    { isDeleted: true },
    { new: true }
  );

  if (!order) return next(new AppError(messages.order.notFound, 404));

  return res.status(200).json({
    message: "Order soft deleted successfully",
    data: order,
  });
});

export const hardDeleteOrder = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findOneAndDelete({
    _id: id,
  });
  if (!order) return next(new AppError(messages.order.notFound, 404));

  return res.status(200).json({
    message: "Order permanently deleted",
  });
});

export const createOrderWithLocation = catchAsyncError(
  async (req, res, next) => {
    const { address, phone, location, fullName } = req.body;

    const user = req.authUser;
    console.log("🧭 Authenticated user ID:", req.authUser._id);

    if (!user) return next(new AppError(messages.auth.userNotFound, 401));

    const email = user.email;

    if (!phone) return next(new AppError("Phone number is required", 400));
    if (!fullName) return next(new AppError("Full name is required", 400));

    if (!address && !location)
      return next(
        new AppError(
          "Please provide either a written address or a current location",
          400
        )
      );

    if (location && (!location.latitude || !location.longitude)) {
      return next(new AppError("Latitude and longitude are required", 400));
    }

    const cart = await Cart.findOne({ user: user._id }).populate({
      path: "products.productId",
      options: { lean: false },
    });

    if (!cart) return next(new AppError(messages.cart.notFound, 404));
    if (!cart.products.length)
      return next(new AppError(messages.cart.empty, 400));

    const orderProducts = [];
    let orderPrice = 0;

    for (const item of cart.products) {
      const product = item.productId;

      if (!product) {
        return next(
          new AppError("A product in your cart no longer exists", 400)
        );
      }

      if (product.stock < item.quantity) {
        return next(new AppError(`${product.title} is out of stock`, 400));
      }

      const finalPrice = product.finalPrice * item.quantity;

      orderProducts.push({
        productId: product._id,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
        discount: product.discount,
        finalPrice,
      });

      orderPrice += finalPrice;

      product.stock -= item.quantity;
      await product.save();
    }

    const finalPrice = orderPrice;

    let locationData = null;
    if (location) {
      let description = location.description;

      if (!description && process.env.GOOGLE_MAPS_API_KEY) {
        try {
          const { data } = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.latitude},${location.longitude}&key=${process.env.GOOGLE_MAPS_API_KEY}`
          );
          description =
            data.results[0]?.formatted_address || "Unknown location";
        } catch (err) {
          console.error("Google Maps API Error:", err.message);
        }
      }

      locationData = {
        latitude: location.latitude,
        longitude: location.longitude,
        description,
      };
    }

    const order = await Order.create({
      user: user._id,
      userName: fullName,
      email,
      products: orderProducts,
      address: address || null,
      location: locationData || null,
      phone,
      orderPrice,
      finalPrice,
    });

    await Cart.findOneAndDelete({ user: user._id });

    res.status(201).json({
      success: true,
      message: messages.order.createdSuccessfully,
      data: order,
    });
  }
);
