import Cart from "../../../database/models/cart.model.js";
import Order from "../../../database/models/order.model.js";
import { AppError, catchAsyncError } from "../../utils/catchError.js";
import { messages } from "../../utils/constant/messages.js";

export const createOrder = catchAsyncError(async (req, res, next) => {
  const { address, phone } = req.body;

  const cart = await Cart.findOne({ user: req.authUser._id }).populate(
    "products.productId"
  );
  if (!cart) return next(new AppError(messages.cart.notFound, 400));
  if (!cart.products.length)
    return next(new AppError(messages.cart.empty, 404));

  let orderProducts = [];
  let orderPrice = 0;

  for (const item of cart.products) {
    const product = item.productId;
    if (!product.instock(item.quentity))
      return next(new AppError(messages.product.outStock, 400));

    orderProducts.push({
      productId: product._id,
      title: product.title,
      price: product.price,
      quantity: item.quentity,
      discount: product.discount,
      finalPrice: product.finalPrice * item.quentity,
    });

    orderPrice += product.finalPrice * item.quentity;
  }

  const finalPrice = orderPrice;

  const order = await Order.create({
    user: req.authUser._id,
    products: orderProducts,
    address,
    phone,
    orderPrice,
    finalPrice,
  });

  await Cart.findOneAndDelete({ user: req.authUser._id });

  res.status(201).json({
    message: messages.order.createdSucessfully,
    success: true,
    data: order,
  });
});
