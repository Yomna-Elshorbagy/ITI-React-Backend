import nodemailer from "nodemailer";
import { emailtemplet } from "./email-templet.js";
import { generateToken } from "./token.js";


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
