import Cart from "../../../database/models/cart.model.js";
import Product from "../../../database/models/product.model.js";
import { AppError, catchAsyncError } from "../../utils/catch-error.js";
import { messages } from "../../utils/constant/messages.js";

const calcTotalPrice = (items) => {
  items.totalPrice = items.products.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
};
const calcNoOfItems = (items) => {
  return items.products.reduce((acc, item) => acc + item.quantity, 0);
};
// export const addToCart = catchAsyncError(async (req, res, next) => {
//   //get data from req
//   let { productId, quantity = 1 } = req.body;

//   //check existence
//   const productExist = await Product.findById(productId);
//   if (!productExist) return next(new AppError(messages.product.notFound, 404));

//   //check stock
//   if (!productExist.instock(quantity)) {
//     return next(new AppError(messages.product.outStock, 404));
//   }
//   // check cart
//   const userCart = await Cart.findOneAndUpdate(
//     {
//       user: req.authUser._id,
//       "products.productId": productId, //search productId in array of products
//     },
//     {
//       $set: { "products.$.price": productExist.price },
//       $inc: { "products.$.quantity": quantity }, //$ this for updating this product quantity
//     },
//     {
//       new: true,
//     }
//   );
//   // let data = userCart;
//   let message = messages.cart.updatedSuccessfully;

//   if (!userCart) {
//     await Cart.findOneAndUpdate(
//       { user: req.authUser._id },
//       {
//         $push: {
//           products: { productId, quantity, price: productExist.price },
//         },
//       },
//       { new: true, upsert: true } // Create the cart if it doesn't exist
//     );
//     message = messages.cart.createdSuccessfully;
//   }

//   // to calculate total price
//   let cartWithDetails = await Cart.findOne({ user: req.authUser._id });
//   // .populate({ path: "products.productId", select: "price" });
//   calcTotalPrice(cartWithDetails);
//   await cartWithDetails.save();
//   const noOfCartItems = calcNoOfItems(cartWithDetails);

//   return res
//     .status(200)
//     .json({ message, success: true, noOfCartItems, cart: cartWithDetails });
// });

// ===> handel cart according to need in react project so  : 
export const addToCart = catchAsyncError(async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;

  // ==> 1- Check product existence
  const productExist = await Product.findById(productId);
  if (!productExist) return next(new AppError(messages.product.notFound, 404));

  // ==> 2️- get or create user cart
  let cart = await Cart.findOne({ user: req.authUser._id });

  if (!cart) {
    // create new cart with the product
    if (!productExist.instock(quantity)) {
      return next(new AppError(messages.product.outStock, 400));
    }

    cart = await Cart.create({
      user: req.authUser._id,
      products: [{ productId, quantity, price: productExist.price }],
    });

    calcTotalPrice(cart);
    await cart.save();

    return res.status(201).json({
      message: messages.cart.createdSuccessfully,
      success: true,
      noOfCartItems: calcNoOfItems(cart),
      cart,
    });
  }

  // ===> 3- If cart exists, check if product already in cart
  const productInCart = cart.products.find(
    (p) => p.productId.toString() === productId
  );

  if (productInCart) {
    const newQuantity = productInCart.quantity + quantity;

    // check if total quantity exceeds stock
    if (!productExist.instock(newQuantity)) {
      return next(new AppError(messages.product.outStock, 400));
    }

    productInCart.quantity = newQuantity;
    productInCart.price = productExist.price;
  } else {
    //  new product in cart
    if (!productExist.instock(quantity)) {
      return next(new AppError(messages.product.outStock, 400));
    }

    cart.products.push({
      productId,
      quantity,
      price: productExist.price,
    });
  }

  // ==> 4️- recalculate totals and save
  calcTotalPrice(cart);
  await cart.save();

  const noOfCartItems = calcNoOfItems(cart);

  res.status(200).json({
    message: productInCart
      ? messages.cart.updatedSuccessfully
      : messages.cart.createdSuccessfully,
    success: true,
    noOfCartItems,
    cart,
  });
});

export const deleteFromCart = catchAsyncError(async (req, res, next) => {
  // Get productId from request body
  const { id } = req.params;
  if (!id) {
    return next(new AppError("Product ID is required", 400));
  }
  // Check if the product exists in the cart
  const userCart = await Cart.findOne({
    user: req.authUser._id,
  });
  // .populate({ path: "products.productId", select: "price" });;
  if (!userCart) return next(new AppError(messages.cart.notFound, 404));
  const product = await Cart.findOne({ "products.productId": id });
  if (!product) return next(new AppError("product not in cart"));
  // Remove the product from the cart
  const updatedCart = await Cart.findOneAndUpdate(
    { user: req.authUser._id },
    { $pull: { products: { productId: id } } }, // Remove the product from the products array
    { new: true }
  );
  calcTotalPrice(updatedCart);
  await updatedCart.save();

  return res.status(200).json({
    message: "Product removed from cart",
    success: true,
    data: updatedCart,
  });
});

export const viewCart = catchAsyncError(async (req, res, next) => {
  const userCart = await Cart.findOne({ user: req.authUser._id });

  if (!userCart) {
    return next(new AppError(messages.cart.notFound, 404));
  }
  const noOfCartItems = calcNoOfItems(userCart);

  return res.status(200).json({
    message: "Cart retrieved successfully",
    success: true,
    noOfCartItems,
    data: userCart,
  });
});

export const clearCart = catchAsyncError(async (req, res, next) => {
  // find the user's cart & clear the products array
  const updatedCart = await Cart.findOneAndUpdate(
    { user: req.authUser._id },
    { $set: { products: [] } }, // set to an empty array
    { new: true }
  );

  if (!updatedCart) {
    return next(new AppError(messages.cart.notFound, 404));
  }

  return res.status(200).json({
    message: "Cart cleared successfully",
    success: true,
    data: updatedCart,
  });
});

export const updateQuantity = catchAsyncError(async (req, res, next) => {
  let { id } = req.params;
  let { quantity } = req.body;
  let cart = await Cart.findOne({ user: req.authUser._id });
  // .populate({ path: "products.productId", select: "price", });
  if (!cart) return next(new AppError(messages.cart.notFound, 404));
  let item = cart.products.find((item) => item.productId._id == id);
  if (!item) {
    return next(new AppError(messages.product.notFound, 404));
  }
  item.quantity = quantity;
  calcTotalPrice(cart);
  await cart.save();
  return res.status(200).json({
    success: true,
    message: messages.cart.updatedSuccessfully,
    data: cart,
  });
});
