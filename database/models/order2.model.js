import mongoose, { Schema } from "mongoose";
import { orderStatus } from './../../src/utils/constant/enums.js';

const orderSchema = new Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },

    userName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
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
      trim: true,
      default: null,
    },

    location: {
      type: {
        latitude: Number,
        longitude: Number,
        description: String,
      },
      default: null,
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
