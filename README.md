# Linkora — Branded Short-Link & Bio-Link Hub

<p align="center">
  <img src="frontend/public/logo.svg" alt="Linkora Logo" width="120" />
</p>

> **Branded links. Smarter sharing.**
> 
> Production-grade MERN Stack Application built for the **Com.bot** Technical Assessment.

---

## 🌟 Technical Assessment Overview

Linkora is a production-quality full-stack platform combining:
1. **High-Performance Short-Link Engine**: 6-character short codes, custom vanity slugs, URL validation, and duplicate collision protection.
2. **Sub-Millisecond Redirect & Click Telemetry**: `GET /r/:shortCode` endpoint returning HTTP 302 with **non-blocking asynchronous telemetry logging**.
3. **Analytics Dashboard**: Time-series clicks over time, referrer breakdowns, and device distribution charts powered by Recharts and MongoDB aggregations.
4. **Bio-Link Profile Builder**: Customizable link-in-bio profile builder supporting Minimal Light, Dark Slate, and Gradient Neon themes with interactive mobile frame preview.
5. **Production Security**: Pair-token JWT authentication (15-min Access Token + 7-day `httpOnly` Refresh Token cookie with refresh token rotation), salted SHA-256 IP hashing (GDPR compliant), and rate limiting.

---

## 🚀 Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript & Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS (Custom neon emerald palette `#40E07B` matching brand logo)
- **UI Components**: Coss UI primitives (Custom Button, Input, Card, Badge, Modal, Toast)
- **Data Fetching**: TanStack Query v5 (React Query)
- **Forms & Validation**: React Hook Form + Zod
- **Data Visualization**: Recharts
- **QR Codes**: `qrcode.react`

### Backend
- **Runtime**: Node.js & Express with TypeScript
- **Database**: MongoDB & Mongoose ODM
- **Authentication**: JWT (Pair-Token Architecture with httpOnly Cookies)
- **Security**: `bcryptjs`, `express-rate-limit`, Zod validation
- **Telemetry Parsing**: `ua-parser-js` & HMAC SHA-256 IP Hashing

---

## 📂 Project Architecture & Folder Structure

```
Linkora/
├── backend/
│   ├── src/
│   │   ├── config/             # DB connection, Zod validated environment config
│   │   ├── controllers/        # Thin HTTP controllers (Auth, Link, Redirect, Analytics, Bio)
│   │   ├── middlewares/        # Auth guard, rate limiters, Zod validator, Error handler
│   │   ├── models/             # Mongoose Schemas (User, ShortLink, ClickEvent, BioProfile)
│   │   ├── routes/             # Express routes (v1 API + /r/:shortCode)
│   │   ├── services/           # Core business logic & non-blocking telemetry
│   │   ├── utils/              # JWT, IP hasher, User-Agent parser, Shortcode generator
│   │   ├── app.ts              # Express application setup
│   │   └── server.ts           # Server entry point
│   ├── scripts/
│   │   └── seed.ts             # Database seed script
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/
│   │   └── logo.svg            # Linkora SVG brand asset
│   ├── src/
│   │   ├── components/         # Coss UI inspired primitives (Button, Input, Card, Modal, Toast, QRModal)
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── layouts/            # DashboardLayout
│   │   ├── lib/                # Axios instance with auto JWT refresh interceptors
│   │   ├── pages/              # Landing, Login, Register, Forgot/Reset Password, Dashboard, Links, Analytics, BioBuilder, PublicBio
│   │   ├── types/              # TypeScript interfaces
│   │   ├── App.tsx             # Routes & Auth Guards
│   │   └── main.tsx            # Entry point
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## 🗄️ Database Design & Indexing Decisions

### 1. `User` Collection
- **`email`**: Unique index `{ email: 1 }` for instant authentication lookups and uniqueness enforcement.
- **`refreshTokenHash`**: Stores salted SHA-256 hash of active refresh token for rotation security.

### 2. `ShortLink` Collection
- **`shortCode`**: Unique index `{ shortCode: 1 }` for sub-millisecond redirect lookup.
- **`customSlug`**: Unique sparse index `{ customSlug: 1 }` for collision-protected vanity URLs.
- **`userId` & `createdAt`**: Compound index `{ userId: 1, createdAt: -1 }` for fast paginated link library queries.

### 3. `ClickEvent` Collection
- **`linkId` & `timestamp`**: Compound index `{ linkId: 1, timestamp: -1 }` for link-specific analytics filtering.
- **`shortCode` & `timestamp`**: Compound index `{ shortCode: 1, timestamp: -1 }` for time-series aggregation pipelines.
- **`ipHash`**: Salted HMAC-SHA256 string for visitor privacy compliance.

### 4. `BioProfile` Collection
- **`username`**: Unique index `{ username: 1 }` for public bio resolution at `/bio/:username`.
- **`userId`**: Unique index `{ userId: 1 }` for 1:1 user-profile binding.

---

## ⚡ High-Performance Redirect Engine Design

```
Client Request ---> GET /r/:shortCode
                      │
                      ▼
          ┌───────────────────────┐
          │  MongoDB Indexed Find │
          │  shortCode/customSlug │
          └───────────┬───────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
     [Not Found]              [Link Active]
         │                         │
         ▼                         ├──────────────────────────┐
  Render 404 Page                  │ (Immediate 302 Response)  │ (Non-blocking Async Telemetry)
                                   ▼                          ▼
                          HTTP 302 Redirect          setImmediate(() => {
                          Location: destination         parseUserAgent();
                                                        hashIP();
                                                        ClickEvent.create();
                                                        ShortLink.incrementClicks();
                                                     })
```

> **Engineering Trade-off Note**: Click telemetry is logged asynchronously using `setImmediate` and unawaited promises so the HTTP 302 response returns immediately without blocking on database writes. In ultra-high scale production environments, a message queue (e.g., Redis Streams / BullMQ or Kafka) would guarantee delivery under server crashes; for this assessment, in-process non-blocking async execution provides high throughput while keeping architecture simple and clean.

---

## 🔒 Security Architecture

1. **JWT Pair-Token Architecture**:
   - **Access Token**: Short-lived (15 minutes), passed in `Authorization: Bearer <token>` header.
   - **Refresh Token**: Long-lived (7 days), stored in an `httpOnly`, `SameSite=Lax`, `Secure` cookie.
2. **Refresh Token Rotation**:
   - Every refresh request generates a new access token and rotates the refresh token cookie.
   - The database stores a SHA-256 hash of the valid refresh token (`refreshTokenHash`). Reuse of an old refresh token immediately invalidates stored hashes to prevent replay attacks.
3. **Input Validation**: All requests are strictly validated using Zod schemas via custom validation middleware.
4. **Rate Limiting**:
   - Auth endpoints (`/login`, `/register`): 15 requests per 15 minutes.
   - Short Link Creation (`POST /links`): 30 requests per 15 minutes.
   - Redirect Route (`GET /r/:shortCode`): 200 requests per minute.
5. **GDPR / Privacy Compliance**: Visitor IP addresses are hashed using HMAC-SHA256 with a secret salt before saving to MongoDB.

---

## 📡 API Endpoint Reference

### Authentication (`/api/v1/auth`)
- `POST /register`: Register user & generate simulated verification token.
- `POST /verify-email`: Verify email address.
- `POST /login`: Authenticate credentials, return access token, set `refreshToken` cookie.
- `POST /refresh`: Rotate refresh token cookie & return new access token.
- `POST /logout`: Revoke stored refresh token hash & clear cookie.
- `POST /forgot-password`: Request password reset token.
- `POST /reset-password`: Reset password using token.
- `GET /me`: Get authenticated user profile.

### Short Links (`/api/v1/links`)
- `POST /`: Create short link (auto-generated code or vanity slug).
- `GET /`: Get paginated links for user (`?page=1&limit=10&search=keyword`).
- `GET /:id`: Get short link details.
- `PATCH /:id`: Update link (title, destination, active state).
- `DELETE /:id`: Delete link and associated telemetry data.

### Redirect Route (`/r`)
- `GET /r/:shortCode`: Public redirect returning HTTP 302.

### Analytics (`/api/v1/analytics`)
- `GET /summary`: Summary overview (total links, total clicks, active links, top link).
- `GET /details`: Time-series clicks over time, referrer breakdown, device distribution (`?days=7`).

### Bio Profiles (`/api/v1/bio`)
- `GET /me`: Get user's bio-link profile settings.
- `PUT /me`: Update bio profile layout, links, theme, and socials.
- `GET /public/:username`: Fetch public bio profile data for `/bio/:username`.

---

## 🛠️ Local Installation & Setup Instructions

### Prerequisites
- Node.js v18+ & npm
- MongoDB running locally (`mongodb://localhost:27017`) or a Cloud MongoDB Atlas connection string.

### 1. Clone & Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/linkora
JWT_ACCESS_SECRET=linkora_super_secret_access_token_key_15m
JWT_REFRESH_SECRET=linkora_super_secret_refresh_token_key_7d
CLIENT_URL=http://localhost:5173
BASE_URL=http://localhost:5000
IP_SALT=linkora_privacy_ip_salt_key_2026
```

### 2. Seed Database with Test Data
```bash
npm run seed
```
> **Seed Script Output**:
> - **Demo User**: `demo@linkora.io`
> - **Password**: `Password123`
> - Generates 5 short links, 340+ click telemetry events across 7 days, and a customized bio profile (`/bio/alexrivera`).

### 3. Run Backend Development Server
```bash
npm run dev
```
Backend API will run on `http://localhost:5000`.

### 4. Setup & Run Frontend
```bash
cd ../frontend
npm install
npm run dev
```
Frontend Vite application will run on `http://localhost:5173`.

---

## 🧪 Technical Assessment Verification Checklist

- [x] Auto-generate unique 6-character short codes with collision protection.
- [x] Custom vanity slug support with collision detection error handling.
- [x] Destination URL validation.
- [x] Public redirect route `GET /r/:shortCode` returning HTTP 302.
- [x] Asynchronous click event logging (timestamp, referrer, device type, browser, hashed IP).
- [x] Analytics dashboard with clicks over time, referrers, and device breakdown.
- [x] Authenticated link library with search and pagination.
- [x] One-click copy & QR code generator.
- [x] Bio-link customizer with Minimal Light, Dark Slate, and Gradient Neon themes.
- [x] Mobile-responsive public bio page at `/bio/:username`.
- [x] Rate limiting on link creation and redirect routes.
- [x] Pair-token JWT authentication with httpOnly cookie and rotation.
- [x] Simulated email verification, login, logout, forgot-password, reset-password flows.
- [x] Database seed script (`npm run seed`) and complete documentation.

---

## 📄 License

Built for the **Com.bot Technical Assessment**.
