import mongoose, { Schema } from "mongoose";
import { orderStatus } from "../../src/utils/constant/enums.js";

const orderSchema = new Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },

    products: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        title: String,
        price: Number,
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        discount: {
          type: Number,
          default: 0,
        },
        finalPrice: Number,
      },
    ],

    address: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    payment: {
      type: String,
      default: "Cash on Delivery",
      immutable: true, 
    },

    status: {
      type: String,
      enum: Object.values(orderStatus),
      default: orderStatus.PLACED,
    },

    orderPrice: {
      type: Number,
      required: true,
    },

    finalPrice: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
