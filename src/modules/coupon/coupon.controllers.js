import Coupon from "../../../database/models/coupon.model.js";
import { AppError, catchAsyncError } from "../../utils/catch-error.js";
import { couponTypes } from "../../utils/constant/enums.js";
import { messages } from "../../utils/constant/messages.js";
import { ApiFeature } from "../../utils/file-feature.js";

export const addCoupon = catchAsyncError(async (req, res, next) => {
  const { code, type, fromDate, expire, discount } = req.body;

  const couponExist = await Coupon.findOne({ code });
  if (couponExist) {
    return next(new AppError(messages.coupon.alreadyExist, 409));
  }

  if (type == couponTypes.PERCENTAGE && couponTypes > 100) {
    return next(new AppError("coupon type must be less than 100", 400));
  }

  //prepare data
  const coupon = new Coupon({
    code,
    type,
    fromDate,
    expire,
    discount,
    createdBy: req.authUser._id,
  });

  const createCoupon = await coupon.save();
  if (!createCoupon)
    return next(new AppError(messages.coupon.failToCreate, 500));
  res.status(201).json({
    message: messages.coupon.createdSuccessfully,
    success: true,
    data: createCoupon,
  });
});

export const updateCoupon = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { code, type, fromDate, expire, discount } = req.body;

  const couponExist = await Coupon.findById(id);
  if (!couponExist) return next(new AppError(messages.coupon.notFound, 404));

  if (code && couponExist.code !== code) {
    const codeExists = await Coupon.findOne({ code });
    if (codeExists) {
      return next(new AppError(messages.coupon.alreadyExist, 400));
    }
  }
  const updatedCoupon = await Coupon.findByIdAndUpdate(
    id,
    {
      code,
      type,
      fromDate,
      expire,
      discount,
    },
    { new: true, runValidators: true }
  );
  if (!updatedCoupon)
    return next(new AppError(messages.coupon.failToUpdate, 500));
  res.status(200).json({
    message: messages.coupon.updatedSuccessfully,
    success: true,
    data: updatedCoupon,
  });
});

export const deleteCoupon = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const couponExist = await Coupon.findById(id);
  if (!couponExist) return next(new AppError(messages.coupon.notFound, 404));

  const deletedCoupon = await Coupon.deleteOne({ _id: id });
  if (deletedCoupon.deletedCount === 0)
    return next(new AppError(messages.coupon.failToDelete, 500));

  res.status(200).json({
    message: messages.coupon.deletedSuccessfully,
    success: true,
    data: deletedCoupon,
  });
});

export const getCoupon = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const coupon = await Coupon.findById(id);
  if (!coupon) return next(new AppError(messages.coupon.notFound, 404));

  res.status(200).json({
    message: messages.coupon.fetchedSuccessfully,
    success: true,
    data: coupon,
  });
});

export const getCoupons = catchAsyncError(async (req, res, next) => {
  const apiFeature = new ApiFeature(Coupon.find(), req.query)
    .pagination()
    .sort()
    .select()
    .filter();
  const coupons = await apiFeature.mongooseQuery;

  res.status(200).json({
    message: messages.coupon.fetchedSuccessfully,
    success: true,
    data: coupons,
  });
});

export const validateCoupon = catchAsyncError(async (req, res, next) => {
  const { code } = req.body;
  const coupon = await Coupon.findOne({ code });
  if (!coupon) return next(new AppError(messages.coupon.notFound, 404));

  const currentDate = Date.now();
  if (coupon.fromDate > currentDate) {
    return next(new AppError("Coupon has not started yet", 400));
  }
  if (coupon.expire < currentDate) {
    return next(new AppError("Coupon has expired", 400));
  }
  res.status(200).json({
    message: "coupon is valid",
    success: true,
    data: coupon,
  });
});
