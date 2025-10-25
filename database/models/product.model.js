import mongoose, { Mongoose } from "mongoose";

let productSchema = mongoose.Schema(
  {
    //====== titles ======//
    title: {
      type: String,
      trim: true,
      unique: [true, "Product title already exist"],
      minlength: [2, "too short Product name"],
    },

    description: {
      type: String,
      required: true,
      minlength: 20,
      maxlength: 2000,
    },
    //====== images ======//
    imageCover: {
      type: Object,
      required: true,
    },
    subImages: [Object],
    //====== price =======//
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
    },
    //====== specific actions =====//
    stock: {
      type: Number,
      min: 0,
      default: 1,
    },
    //====== id's =======//
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rate: {
      type: Number,
      min: 0,
      max: 5,
      default: 5,
    },
    isDeleted: { type: Boolean, default: false },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true }, //json res
    toObject: { virtuals: true }, //log
  }
);

productSchema.virtual("finalPrice").get(function () {
  return this.price - this.price * ((this.discount || 0) / 100);
});

productSchema.methods.instock = function (quantity) {
  return this.stock >= quantity ? true : false;
};

productSchema.pre("save", async function (next) {
  if (!this.isModified("price")) return next(); // Only run if price changes

  const previousProduct = await Product.findById(this._id);
  if (!previousProduct) return next();

  if (this.price < previousProduct.price) {
    await notifyUsersAboutPriceDrop(
      this._id,
      previousProduct.price,
      this.price
    );
  }

  next();
});

//==> get Reviews for specific product with virtual populate
productSchema.virtual("Reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
});
productSchema.pre("findOne", function () {
  this.populate("Reviews");
});

let Product = mongoose.model("Product", productSchema);
export default Product;
