# 💎 KAYAN Jewelry – Backend API Documentation

A full-featured **E‑Commerce Backend** for **KAYAN Jewelry**, built with **Node.js, Express, MongoDB**, following a modular and scalable architecture. This backend powers authentication, products, orders, analytics, notifications, and admin dashboards.

---

## 🚀 Project Overview

KAYAN is a modern jewelry e‑commerce platform supporting:
- Customers browsing & purchasing jewelry
- Admins managing products, orders, users, and analytics
- Secure authentication & authorization
- Advanced features like OTP, Google OAuth, QR login, reviews, coupons, and notifications

---

## 🛠 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT, Google OAuth, OTP
- **File Upload:** Multer + Cloudinary
- **Process Manager:** PM2
- **Security:** bcrypt, role-based authorization
- **Utilities:** Nodemailer, WhatsApp API, QR Codes

---

## 📂 Project Structure

```bash
src/
│── modules/
│   ├── auth/          # Authentication & Authorization
│   ├── cart/          # Shopping cart logic
│   ├── category/      # Jewelry categories
│   ├── contact/       # Contact & customer support
│   ├── coupon/        # Coupons & discounts
│   ├── order/         # Orders & checkout
│   ├── product/       # Jewelry products
│   ├── qrcode/        # QR login & validation
│   ├── review/        # Reviews & ratings
│   ├── user/          # User profiles & analytics
│   └── wishlist/      # Wishlist functionality
│
│── utils/
│   ├── constant/      # Enums & messages
│   ├── fileUpload/    # Cloudinary & Multer helpers
│   ├── notifications/# WhatsApp, Email, OTP
│   ├── oAuth/         # Google OAuth
│   ├── token.js       # JWT handling
│   ├── otp.js         # OTP generation & validation
│   ├── global-error.js
│   └── catch-error.js
│
│── middelwares/
│   ├── auth.js        # Authentication & roles
│   └── validate.js    # Joi validation
│
│── index.js           # App entry point
│── .env
│── package.json
```

---

## 🔐 Authentication & Authorization

### Auth Routes (`/auth`)
| Method | Endpoint | Description |
|------|--------|------------|
| POST | `/signup` | User registration + image upload |
| POST | `/login` | User login |
| POST | `/google-login` | Google OAuth login |
| GET  | `/verify/:token` | Email verification |
| POST | `/verifyOtp` | OTP verification |
| PUT  | `/forgetPass` | Forgot password |
| PUT  | `/changePass` | Change password |
| POST | `/logout` | Logout |
| GET  | `/activity` | Login activity |

Roles supported:
- **ADMIN** – full access
- **USER** – shopping & profile

---

## 🛒 Cart Module (`/cart`)
| Method | Endpoint | Description |
|------|--------|------------|
| GET | `/` | View cart |
| POST | `/` | Add item to cart |
| PUT | `/:id` | Update quantity |
| PUT | `/deleteitem/:id` | Remove item |
| DELETE | `/` | Clear cart |

---

## 📦 Category Module (`/category`)

- Manage jewelry categories
- Analytics & trending categories

| Method | Endpoint | Access |
|------|--------|--------|
| POST | `/addCategory` | Admin |
| GET | `/` | Public |
| GET | `/analytics/trending` | Public |
| PUT | `/soft/:id` | Admin |
| DELETE | `/:id` | Admin |

---

## 💍 Product Module (`/product`)

Supports advanced jewelry management:
- Image cover + gallery
- Trending & top-selling
- Import/Export
- Price drop notifications

| Method | Endpoint | Description |
|------|--------|------------|
| POST | `/` | Add product (Admin) |
| GET | `/` | Get all products |
| GET | `/trending` | Trending jewelry |
| GET | `/topSelling` | Best sellers |
| POST | `/subscribe-price/:id` | Price alerts |
| PUT | `/soft/:id` | Soft delete |

---

## 🧾 Order Module (`/order`)

| Method | Endpoint | Description |
|------|--------|------------|
| POST | `/` | Create order |
| GET | `/` | User orders |
| GET | `/allorders` | Admin orders |
| PUT | `/status/:id` | Update status (Admin) |
| GET | `/exportpdf` | Export PDF |
| GET | `/exportcsv` | Export CSV |

---

## ⭐ Review Module (`/review`)

- Product reviews & ratings
- Admin moderation
- Contact reviewers

---

## 🎟 Coupon Module (`/coupon`)

- Percentage & fixed discounts
- Validation logic
- Soft & hard delete

---

## 👤 User Module (`/user`)

Includes **dashboard analytics**:
- User demographics
- Deleted users analysis
- Overview statistics

---

## ❤️ Wishlist Module (`/wishlist`)

- Add/remove jewelry
- Clear wishlist

---

## 🔔 Notifications & Utilities

- 📧 Email (verification, reset password)
- 📱 WhatsApp notifications
- 🔐 OTP system
- 🔑 JWT tokens
- 🖼 Cloudinary file handling

---

## 🔒 Security Features

- JWT authentication
- Role-based authorization
- Password hashing (bcrypt)
- OTP expiration
- Soft delete strategy

---

## 🧪 Environment Variables

```env
mongoose_URI=
MONGODB_ATLAS=
SECRET_KEY=
EMAIL_KEY=
SENDEMAIL=
SENDEMAILPASSWORD=
SECRETKEYRESETPASS=
TOKEN_PRIFEX1=
TOKEN_PRIFEX2=
SALT_ROUNDS=
CLOUD_NAME =
API_KEY =
API_SECRET=
SECURE_URL=
PUBLIC_ID=
TWILIO_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=
FRONTEND_URL=https://kayan-store.vercel.app/
GOOGLE_CLIENT_ID=
APPLICATION_NAME="KAYAN Jewelery"
GOOGLE_MAPS_API_KEY=
```

---

## ▶️ Run Project Locally

```bash
npm install
npm run dev
```

---

## 🌍 Deployment

- Vercel Deployment
- https://iti-react-backend.vercel.app/

---

## 👨‍💻 Author

**KAYAN Jewelry Backend ==>**
**For Yomna**

---

## 📜 License

This project is licensed for **KAYAN Jewelry** internal use.

