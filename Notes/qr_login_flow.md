# ⚙️ QR Login Flow

Here’s the flow you should expect:

## Step 1️⃣: User already logged in on Device A (mobile or desktop)

- The user signs up and logs in normally (email + password).
- On their dashboard, they request a login QR code.
- my API `/login-generate` generates a short-lived JWT (type: `qr-login`) containing the `userId`.
- That QR is displayed.

## Step 2️⃣: User scans QR from Device B (other device)

- Device B (maybe our React app on another PC/phone) scans the QR.
- It extracts the token from the QR code link.
- Device B sends a `POST /login-validate` request with `{ token }`.

## Step 3️⃣: Backend validates token

- Backend checks:
  - Token is valid + not expired.
  - Token type = `qr-login`.
  - The user still exists.
- If valid → Backend issues a normal login `accessToken`.

## Step 4️⃣: Device B is now logged in

- Device B saves the `accessToken` in localStorage/session/cookie.
- Device A can even be notified (optional).

---

# 🧪 Testing in Postman

### 1. Generate QR for login

```
GET http://localhost:3000/qr/login-generate
Headers: authentication: bearer <user_access_token>
```

**Response:**

```json
{
  "success": true,
  "qrCode": "data:image/png;base64,...",
  "expiresIn": "1h"
}
```

### 2. Validate QR (login with scanned QR)

```
POST http://localhost:3000/qr/login-validate
Body: { "token": "<qr_token_from_link>" }
```

**Response if valid:**

```json
{
  "message": "QR login successful",
  "success": true,
  "accessToken": "<normal_access_token>"
}
```
