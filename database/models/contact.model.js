import mongoose from "mongoose";
import { replay } from "../../src/utils/constant/enums.js";

const contactSchema = new mongoose.Schema(
  {
    fullName: {
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
    message: {
      type: String,
      required: true,
      trim: true,
    },
    replyStatus: {
      type: String,
      enum: Object.values(replay),
      default: replay.PENDING, 
    },
    replyMessage: {
      type: String,
      default: null,
      trim: true,
    },
    repliedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Contact = mongoose.model("Contact", contactSchema);
export default Contact;
