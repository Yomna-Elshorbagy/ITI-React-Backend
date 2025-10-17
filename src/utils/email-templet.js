export const emailtemplet = (token, otpCode) => {
  return `
    <div style="font-family: 'Poppins', sans-serif; background-color: #fdf9f3; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); overflow: hidden;">
        
        <!-- Header -->
        <div style="background-color: #c59d5f; color: #fff; padding: 25px; text-align: center;">
          <h2 style="margin: 0; font-size: 24px;">💎 Kayan Jewelry</h2>
          <p style="margin: 5px 0 0; font-size: 14px;">Elegant Pieces, Timeless Beauty</p>
        </div>

        <!-- Body -->
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #333;">Dear Valued Customer,</p>
          <p style="font-size: 15px; color: #555;">
            Thank you for choosing <b>Kayan Jewelry</b>. To verify your email and complete your registration, please use the code below or click the verification button.
          </p>

          <div style="margin: 25px auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px; text-align: center;">
            <h3 style="margin: 0; color: #c59d5f; font-size: 26px; letter-spacing: 3px;">${otpCode}</h3>
            <p style="margin-top: 8px; font-size: 13px; color: #999;">Your OTP code will expire in 10 minutes.</p>
          </div>

          <!-- Verify Button -->
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://iti-react-backend.vercel.app/auth/verify/${encodeURIComponent(token)}"
              style="background-color: #c59d5f; color: #fff; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-size: 16px; display: inline-block;">
              Verify Your Email
            </a>
          </div>

          <p style="margin-top: 30px; font-size: 14px; color: #777; text-align: center;">
            If you didn’t request this verification, you can safely ignore this email.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #fdf9f3; color: #666; text-align: center; padding: 20px; font-size: 13px;">
          <p style="margin: 0;">Sent with ❤️ by <b>Kayan Jewelry</b></p>
          <p style="margin: 5px 0 0;">
            <a href="http://localhost:5173/" target="_blank" style="color: #c59d5f; text-decoration: none;">Visit Our Website</a>
          </p>
        </div>

      </div>
    </div>
  `;
};
