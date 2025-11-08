import nodemailer from "nodemailer";
import { emailtemplet } from "./email-templet.js";
import { generateToken } from "./token.js";
import { PriceAlert } from "../../database/models/priceAlert.model.js";
import { sendWhatsAppNotification } from './notifications/send-whatsapp.js';
import Product from "../../database/models/product.model.js";


export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDEMAIL,
    pass: process.env.SENDEMAILPASSWORD,
  },
});

export const sendEmail = async (_id , email, role,  otpCode ) => {
  const token = await generateToken({ payload: { _id, email , role}, secretKey: process.env.EMAIL_KEY });

      // send mail with defined transport object
      const info = await transporter.sendMail({
        from: `"ITI React project 👻" <${process.env.SENDEMAIL}>`, 
        to: email, 
        subject: "Confirm Email", 
        text: `Your OTP code is ${otpCode}`,
        html: emailtemplet(token, otpCode), 
      });

      console.log("Message sent: %s", info.messageId);
        return token;
  }


export async function sendResetPasswordMail( email, otpCode) {
  const info = await transporter.sendMail({
      from: `"project 👻" <${process.env.SENDEMAIL}>`,
      to: email,
      subject: "Reset Password ✔",
      text: "Hello ?",
      html: `<p>Hi, your verification code is: ${otpCode}</p>`,
  });
  console.log("Message sent:", info.messageId);
}

export async function sendCustomEmail({ to, subject, text, html, reviewerName }) {
  const supportEmail = process.env.SUPPORT_EMAIL || "yumnamohamed30@gmail.com";

  const htmlTemplate = html || `
    <div style="font-family: 'Poppins', sans-serif; background-color: #fdf9f3; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background-color: #c59d5f; color: #fff; text-align: center; padding: 20px;">
          <h2 style="margin: 0; font-size: 22px;">💬 Message from Kayan Jewelry Support</h2>
        </div>
        
        <!-- Body -->
        <div style="padding: 25px;">
          <p style="font-size: 16px; color: #333;">
            Dear ${reviewerName || "Valued Customer"},
          </p>

          <p style="font-size: 15px; color: #555; line-height: 1.6;">
            ${text || "Thank you for sharing your feedback with us. We truly value your time and input!"}
          </p>

          <p style="font-size: 15px; color: #555; line-height: 1.6;">
            Our support team wanted to personally reach out to you to assist or discuss your recent review.
          </p>

          <div style="margin-top: 25px; text-align: center;">
            <a href="mailto:${supportEmail}" 
               style="background-color: #c59d5f; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 15px;">
              Reply to Support
            </a>
          </div>

          <p style="margin-top: 30px; font-size: 14px; color: #888; text-align: center;">
            — Kayan Jewelry Support Team 💎
          </p>
        </div>
      </div>
    </div>
  `;

  const info = await transporter.sendMail({
    from: `"Kayan Jewelry Support 💍" <${process.env.SENDEMAIL}>`,
    to,
    subject,
    html: htmlTemplate,
  });

  console.log(`Support email sent to ${to}:`, info.messageId);
  return info;
}



//==> send mail to user when subscribe to price drop product alert
export const notifyUsersAboutPriceDropInternal = async (productId, oldPrice, newPrice) => {
  const alerts = await PriceAlert.find({
    product: productId,
    subscribedPrice: { $gt: newPrice },
  }).populate("user");

  if (!alerts.length) {
    console.log("No users subscribed for price alerts.");
    return;
  }

  const product = await Product.findById(productId);
  const productName = product?.title || "Your Favorite Product";

  const emailList = [];

  // Collect emails and send WhatsApp messages
  for (const alert of alerts) {
    if (alert.user.email) emailList.push(alert.user.email);
    if (alert.user.mobileNumber) {
      await sendWhatsAppNotification(alert.user.mobileNumber, oldPrice, newPrice);
    }
  }

  // Build email HTML template
  const htmlTemplate = `
    <div style="font-family: 'Poppins', sans-serif; background-color: #fdf9f3; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background-color: #c59d5f; color: #fff; text-align: center; padding: 20px;">
          <h2 style="margin: 0; font-size: 22px;">💎 KAYAN Jewelry Price Drop Alert!</h2>
        </div>
        
        <!-- Body -->
        <div style="padding: 25px;">
          <p style="font-size: 16px; color: #333; text-align: center;">Hi there,</p>

          <p style="font-size: 15px; color: #555; line-height: 1.6; text-align: center;">
            Exciting news! The price of <strong>${productName}</strong> just dropped!
          </p>

          <div style="background-color: #fdf3e7; border-radius: 10px; padding: 15px; text-align: center; margin: 20px 0;">
            <p style="font-size: 18px; color: #333; margin: 5px 0;">
              <strong>Old Price:</strong> <span style="text-decoration: line-through; color: #999;">$${oldPrice.toFixed(2)}</span>
            </p>
            <p style="font-size: 22px; color: #c59d5f; margin: 5px 0;">
              <strong>New Price:</strong> $${newPrice.toFixed(2)}
            </p>
          </div>

          <div style="text-align: center; margin-top: 25px;">
            <a href="${process.env.CLIENT_URL || "https://kayan-jewelry.com"}/product/${productId}" 
               style="background-color: #c59d5f; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 16px;">
              ✨ View Product
            </a>
          </div>

          <p style="margin-top: 30px; font-size: 14px; color: #888; text-align: center;">
            — The Kayan Jewelry Team 💍
          </p>
        </div>
      </div>
    </div>
  `;

  // Send the email
  if (emailList.length) {
    const mailOptions = {
      from: `"Kayan Jewelry 💍" <${process.env.SENDEMAIL}>`,
      to: emailList,
      subject: `💎 Price Drop: ${productName} now only $${newPrice}!`,
      html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📩 Sent price drop email notifications to ${emailList.length} users for "${productName}".`);
  }
};
