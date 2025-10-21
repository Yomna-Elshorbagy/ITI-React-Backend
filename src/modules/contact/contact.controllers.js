import Joi from "joi";
import { AppError, catchAsyncError } from "../../utils/catch-error.js";
import { sendContactMail } from "../../utils/contectEmail.js";
import Contact from "../../../database/models/contact.model.js";
import { transporter } from "../../utils/email.js";

//===> validation schema
const contactSchema = Joi.object({
  fullName: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  message: Joi.string().min(10).max(1000).required(),
});

export const contactUs = catchAsyncError(async (req, res, next) => {
  const { error } = contactSchema.validate(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));

  const { fullName, email, message } = req.body;

  await sendContactMail({ fullName, email, message });

  await Contact.create({ fullName, email, message });

  return res.status(200).json({
    success: true,
    message: "Your message has been sent successfully!",
  });
});

export const getAllContacts = catchAsyncError(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const totalContacts = await Contact.countDocuments();
  const totalPages = Math.ceil(totalContacts / limit);

  const contacts = await Contact.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    message: "Contacts fetched successfully",
    pagination: {
      currentPage: page,
      totalPages,
      totalContacts,
    },
    data: contacts,
  });
});

export const replyToContact = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { replyMessage } = req.body;

  const contact = await Contact.findById(id);
  if (!contact) return next(new AppError("Contact not found", 404));

  await transporter.sendMail({
    from: `"Kayan Jewelry 💍" <${process.env.SENDEMAIL}>`,
    to: contact.email,
    subject: "Reply from Kayan Jewelry Support",
    html: `
      <div style="font-family: Poppins, sans-serif; background-color: #fdf9f3; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 15px; text-align: center; padding: 25px;">
          <h2 style="color: #c59d5f;">Dear ${contact.fullName},</h2>
          <p style="font-size: 16px; color: #555;">${replyMessage}</p>
          <p style="font-size: 14px; color: #999;">— Kayan Jewelry Support 💍</p>
        </div>
      </div>
    `,
  });

  contact.replyMessage = replyMessage;
  contact.replyStatus = "replied";
  contact.repliedAt = new Date();
  await contact.save();

  res.status(200).json({
    success: true,
    message: "Reply sent successfully",
    data: contact,
  });
});
export const deleteContact = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const contact = await Contact.findByIdAndDelete(id);
  if (!contact) return next(new AppError("Contact not found", 404));

  res.status(200).json({
    success: true,
    message: "Contact deleted successfully",
  });
});

export const softDeleteContact = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const contact = await Contact.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );

  if (!contact) return next(new AppError("Contact not found", 404));

  res.status(200).json({
    success: true,
    message: "Contact soft deleted successfully",
    data: contact,
  });
});

export const updateContact = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const allowedUpdates = ["fullName", "email", "message", "replyStatus", "replyMessage"];
  const updates = Object.keys(req.body);

  const isValidOperation = updates.every((key) =>
    allowedUpdates.includes(key)
  );

  if (!isValidOperation)
    return next(new AppError("Invalid fields for update", 400));

  const contact = await Contact.findById(id);
  if (!contact) return next(new AppError("Contact not found", 404));

  updates.forEach((key) => {
    contact[key] = req.body[key];
  });

  if (contact.replyMessage && contact.replyStatus === "replied") {
    contact.repliedAt = new Date();
  }

  await contact.save();

  res.status(200).json({
    success: true,
    message: "Contact updated successfully",
    data: contact,
  });
});

