import Joi from "joi";
import { AppError, catchAsyncError } from "../../utils/catch-error.js";
import { sendContactMail } from "../../utils/contectEmail.js";

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

  return res.status(200).json({
    success: true,
    message: "Your message has been sent successfully!",
  });
});
