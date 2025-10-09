import { Types } from "mongoose";
import { messages } from "../../utils/constant/messages.js";
import { AppError, catchAsyncError } from "../../utils/catch-error.js";
import Product from './../../../database/models/product.model.js';
import User from "../../../database/models/user.model.js";

export const addToWishlist = catchAsyncError(async (req, res, next) => {
  let { productId } = req.body;
  productId = new Types.ObjectId(productId);
  const productExist = await Product.findById(productId);
  if (!productExist) {
    return next(new AppError(messages.product.notFound, 404));
  }

  const user = await User.findOneAndUpdate(
    { _id: req.authUser._id },
    { $addToSet: { wishlist: productId } }, //addToSet : to add product only once [insted of $push]
    { new: true }
  );
  return res.status(200).json({
    message: messages.wishlist.createdSuccessfully,
    success: true,
    data: user.wishlist,
  });
});

export const deleteWishlist = catchAsyncError(async (req, res, next) => {
  const { productId } = req.params;
  const user = await User.findOneAndUpdate(
    { _id: req.authUser._id },
    { $pull: { wishlist: productId } },
    { new: true }
  ).select("wishlist");
  return res.status(200).json({
    message: messages.wishlist.deletedSuccessfully,
    success: true,
    data: user,
  });
});

export const getLoggedUserWishlist = catchAsyncError(async (req, res, next) => {
  const userWishlist = await User.findById(
    req.authUser,
    { wishlist: 1 },
    { populate: { path: "wishlist" } }
  );
  return res.status(200).json({ data: userWishlist });
});

export const clearWishlist = catchAsyncError(async (req, res, next) => {
  const user = await User.findOneAndUpdate(
    { _id: req.authUser._id },
    { $set: { wishlist: [] } },
    { new: true }
  ).select("wishlist");

  return res.status(200).json({
    message: messages.wishlist.clearedSuccessfully ,
    success: true,
    data: user.wishlist, 
  });
});
