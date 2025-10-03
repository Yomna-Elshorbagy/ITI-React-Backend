import Category from "../../../database/models/category.model.js";
import Product from "../../../database/models/product.model.js";
import { AppError, catchAsyncError } from "../../utils/catch-error.js";
import { messages } from "../../utils/constant/messages.js";
import { ApiFeature } from "../../utils/file-feature.js";
import cloudinary from "../../utils/fileUpload/cloudinary.js";
import { deleteCloud } from "../../utils/fileUpload/file-functions.js";

export const addProduct = catchAsyncError(async (req, res, next) => {
  let {
    title,
    description,
    imageCover,
    subImages = [],
    price,
    discount,
    stock,
    category,
  } = req.body;

  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    return next(new AppError(messages.category.notFound, 404));
  }

  // uplods
  let failImages = [];
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.files.imageCover[0].path,
    { folder: "ITI-REACT/product/imageCover" }
  );
  failImages.push(public_id);
  imageCover = { secure_url, public_id };

  for (const file of req.files.subImages) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      { folder: "ITI-REACT/product/subImages" }
    );
    subImages.push({ secure_url, public_id });
    failImages.push(public_id);
  }
  // add to database
  let newProduct = new Product({
    title,
    description,
    imageCover, //[{}]
    subImages, //[{},{} ]
    price,
    discount,
    stock,
    category,
    createdBy: req.authUser._id,
    updatedBy: req.authUser._id,
  });
  const createdPro = await newProduct.save();

  if (!createdPro) {
    req.failImages = public_id;
    return next(new AppError(messages.product.failToCreate, 500));
  }
  res.status(201).json({
    message: messages.product.createdSuccessfully,
    success: true,
    data: newProduct,
  });
});

export const updateProductCloud = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let product = await Product.findOne({ _id: id });
  if (!product) return next(new AppError(messages.product.notFound, 404));

  // Check if current user is the creator
  if (
    product.createdBy.toString() !== req.authUser._id.toString() &&
    req.authUser.role !== "admin"
  ) {
    return next(
      new AppError("You are not authorized to Update this product", 403)
    );
  }

  let failImages = [];

  if (req.files && req.files.imageCover) {
    await deleteCloud(product.imageCover?.public_id);
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.files.imageCover[0].path,
      { folder: "ITI-REACT/product/imageCover" }
    );
    failImages.push(public_id);
    product.imageCover = { secure_url, public_id };
  }

  if (req.files && req.files.subImages) {
    const oldSubImagesPublicIds = product.subImages.map((img) => img.public_id);
    product.subImages = [];
    for (const file of req.files.subImages) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        { folder: "ITI-REACT/product/subImages" }
      );
      product.subImages.push({ secure_url, public_id });
      failImages.push(public_id);
    }
    for (const publicId of oldSubImagesPublicIds) {
      if (publicId) await deleteCloud(publicId);
    }
  }
  const updatableFields = [
    "title",
    "description",
    "price",
    "discount",
    "stock",
    "category",
  ];

  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field];
    }
  });
  product.updatedBy = req.authUser._id;

  const updatedProduct = await product.save();
  if (!updatedProduct) {
    req.failImages = failImages;
    return next(new AppError(messages.product.failToUpdate, 500));
  }

  res.status(200).json({
    message: messages.product.updatedSuccessfully,
    data: updatedProduct,
  });
});

export const deleteProduct = catchAsyncError(async (req, res, next) => {
  let { id } = req.params;
  const product = await Product.findById(id);
  if (!product) return next(new AppError(messages.product.notFound, 404));

  // Check if current user is the creator
  if (
    product.createdBy.toString() !== req.authUser._id.toString() &&
    req.authUser.role !== "admin"
  ) {
    return next(
      new AppError("You are not authorized to delete this product", 403)
    );
  }

  //delete images
  await cloudinary.uploader.destroy(product.imageCover.public_id);
  for (const image of product.subImages) {
    await cloudinary.uploader.destroy(image.public_id);
  }

  let deleteProduct = await Product.findByIdAndDelete(id);
  if (!deleteProduct)
    return next(new AppError(messages.product.failToUpdate, 500));
  res.status(200).json({
    message: messages.product.deletedSucessfully,
    sucess: true,
    data: deleteProduct,
  });
});

export const getLowStock = catchAsyncError(async (req, res) => {
  const threshold = parseInt(req.query.threshold) || 10;
  const products = await Product.find({ stock: { $lte: threshold } });
  res.json({ success: true, threshold, count: products.length, products });
});

export const getAllProducts = catchAsyncError(async (req, res, next) => {
  const Products = await Product.find()
    .populate({
      path: "createdBy",
      select: ["address", "userName", "mobileNumber"],
    })
    .populate({
      path: "category",
      select: ["name", "image", "createdBy"],
    });
  res.status(200).json({ success: true, message: "Products are : ", Products });
});

// api feature
export const getProducts = catchAsyncError(async (req, res, next) => {
  const { category, page = 1, size = 10 } = req.query;

  let productQuery = Product.find()
    .populate({
      path: "createdBy",
      select: ["address", "userName", "mobileNumber"],
    })
    .populate({
      path: "category",
      select: ["name", "image", "createdBy"],
    });

  // If category is provided, filter by it
  if (category) {
    productQuery = productQuery.where("category").equals(category);
  }

  const apiFeature = new ApiFeature(productQuery, req.query).filter().search();

  const countQuery = new ApiFeature(
    Product.find()
      .populate({
        path: "createdBy",
        select: ["address", "userName", "mobileNumber"],
      })
      .populate({
        path: "category",
        select: ["name", "image", "createdBy"],
      }),
    req.query
  )
    .filter()
    .search();

  const totalDocuments = await countQuery.mongooseQuery.countDocuments();

  apiFeature.pagination().sort().select();
  const products = await apiFeature.mongooseQuery;

  const numberOfPages = Math.ceil(totalDocuments / size);

  return res.json({
    results: products.length,
    metadata: {
      currentPage: parseInt(page),
      numberOfPages,
      limit: parseInt(size),
      prevPage: page > 1 ? page - 1 : null,
    },
    message: messages.product.fetchedSuccessfully,
    success: true,
    data: products,
  });
});

export const getSpeCificProduct = catchAsyncError(async (req, res, next) => {
  let { id } = req.params;
  let product = await Product.findById(id)
    .populate({
      path: "createdBy",
      select: ["address", "userName", "mobileNumber"],
    })
    .populate({
      path: "category",
      select: ["name", "slug", "image", "createdBy"],
    });
  if (!product) return next(new AppError(messages.product.notFound, 404));
  res.status(200).json({ message: "Product is : ", data: product });
});