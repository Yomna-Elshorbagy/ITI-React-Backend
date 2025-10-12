import { transporter } from "./email.js";

export const sendContactMail = async ({ fullName, email, message }) => {
  const supportEmail = process.env.SUPPORT_EMAIL || "yumnamohamed30@gmail.com";

  const htmlTemplate = `
    <div style="font-family: 'Poppins', sans-serif; background-color: #fdf9f3; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background-color: #c59d5f; color: #fff; padding: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 22px;">💎 Jewelry House - New Inquiry</h2>
        </div>
        <div style="padding: 25px;">
          <p style="font-size: 16px; color: #333;">Hello Admin,</p>
          <p style="font-size: 15px; color: #555;">
            You’ve received a new message from the <b>Contact Us</b> page:
          </p>

          <div style="margin-top: 20px; background-color: #f9f9f9; padding: 15px; border-radius: 10px;">
            <p style="margin: 5px 0;"><b>👤 Name:</b> ${fullName}</p>
            <p style="margin: 5px 0;"><b>📧 Email:</b> <a href="mailto:${email}" style="color:#c59d5f;">${email}</a></p>
            <p style="margin: 15px 0;"><b>💬 Message:</b><br/> ${message}</p>
          </div>

          <p style="margin-top: 25px; font-size: 14px; color: #888; text-align: center;">
            — Jewelry House Team 💍
          </p>
        </div>
      </div>
    </div>
  `;

  // Send to admin
  const info = await transporter.sendMail({
    from: `"Jewelry House 💍" <${process.env.SENDEMAIL}>`,
    to: supportEmail,
    subject: `💌 New Contact Message from ${fullName}`,
    html: htmlTemplate,
  });

  console.log("Contact message sent:", info.messageId);

  // Auto-reply to user
  const replyHtml = `
    <div style="font-family: 'Poppins', sans-serif; background-color: #fdf9f3; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 15px; text-align: center; padding: 25px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #c59d5f;">Thank You, ${fullName}! 💎</h2>
        <p style="font-size: 16px; color: #555;">
          We’ve received your message and our jewelry experts will reach out to you soon.
        </p>
        <p style="font-size: 14px; color: #999;">— The Jewelry House Team 💍</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Jewelry House 💍" <${process.env.SENDEMAIL}>`,
    to: email,
    subject: "Thank you for contacting Jewelry House",
    html: replyHtml,
  });
};
