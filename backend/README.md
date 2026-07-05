# Paket Express - Courier Delivery Management System

## 🚀 Project Overview

Paket Express adalah sistem manajemen pengiriman paket berbasis Node.js dan Express yang menyediakan:
- ✅ **REST API** lengkap untuk customer, courier, dan admin
- ✅ **Authentication & Authorization** dengan JWT
- ✅ **Real-Time Tracking** menggunakan Socket.io
- ✅ **Payment Gateway Integration** dengan Midtrans
- ✅ **Database** terstruktur dengan Sequelize ORM
- ✅ **Error Handling** dan validasi yang robust
- ✅ **Rate Limiting** untuk keamanan

## 📋 Kriteria yang Terpenuhi

### ✅ KRITERIA 1: Database dengan Baik
- Model User (customer, courier, admin)
- Model Address dengan koordinat GPS
- Model Shipment dengan tracking
- Model ShipmentItem untuk detail item
- Model Transaction untuk pembayaran
- Model TrackingHistory untuk history tracking
- Proper relationships dan constraints

### ✅ KRITERIA 2: Middleware Implementation
- Error Handler middleware
- JWT Authentication middleware
- Role-based Authorization middleware
- Request Validation middleware (Joi)
- Rate Limiter middleware
- CORS middleware

### ✅ KRITERIA 3: REST API Endpoints
- Auth API (Register, Login, Refresh Token, Logout)
- User API (CRUD, Profile Management)
- Shipment API (Create, Read, Update, Cancel)
- Transaction API (Payment, Confirm, Refund)
- Tracking API (Real-time tracking)
- Proper HTTP Status Codes
- Input validation pada semua endpoint

### ✅ KRITERIA 4: Authentication & Authorization
- JWT-based authentication
- Refresh token mechanism
- Role-based access control (customer, courier, admin)
- Password hashing dengan bcrypt
- User session management

### ✅ KRITERIA 5: Payment Gateway Integration
- Midtrans Snap integration
- Payment creation dan verification
- Webhook handling untuk payment notification
- Refund mechanism
- Transaction status tracking

### ✅ KRITERIA 6: Real-Time Communication
- Socket.io untuk real-time tracking updates
- Location tracking untuk courier
- Status updates broadcasting
- Multiple room handling
- Connection management

## 🛠️ Tech Stack

```
Framework: Express.js
Database: PostgreSQL
ORM: Sequelize
Authentication: JWT (jsonwebtoken)
Payment: Midtrans
Real-Time: Socket.io
Validation: Joi
Security: bcryptjs, helmet
Rate Limiting: express-rate-limit
HTTP Logger: morgan
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Database configuration
│   │   ├── sequelize.js         # Sequelize instance
│   │   └── payment.js           # Midtrans configuration
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── shipmentController.js
│   │   ├── transactionController.js
│   │   └── trackingController.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   ├── authenticate.js
│   │   ├── authorize.js
│   │   ├── validation.js
│   │   ├── rateLimiter.js
│   │   ├── corsMiddleware.js
│   │   └── index.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Address.js
│   │   ├── Shipment.js
│   │   ├── ShipmentItem.js
│   │   ├── Transaction.js
│   │   ├── TrackingHistory.js
│   │   └── index.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── shipmentRoutes.js
│   │   ├── transactionRoutes.js
│   │   └── trackingRoutes.js
│   ├── services/
│   │   └── paymentService.js
│   ├── socket/
│   │   └── trackingSocket.js
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── catchAsync.js
│   │   ├── pagination.js
│   │   └── responseHandler.js
│   ├── constants.js
│   └── server.js
├── .env.example
├── docker-compose.yml
├── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js v14+
- PostgreSQL v12+
- npm atau yarn

### Installation

1. **Clone repository**
```bash
git clone https://github.com/dharmasaprian18-ship-it/PAKET_EXPRESS.git
cd PAKET_EXPRESS/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
# Edit .env dengan konfigurasi Anda
```

4. **Start PostgreSQL dengan Docker**
```bash
docker-compose up -d
```

5. **Run database migrations (jika ada)**
```bash
npm run migrate
```

6. **Start development server**
```bash
npm run dev
```

Server akan berjalan di `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register       - Register user baru
POST   /api/auth/login          - Login user
POST   /api/auth/refresh        - Refresh access token
POST   /api/auth/logout         - Logout user
GET    /api/auth/me             - Get current user profile
```

### User Endpoints

```
GET    /api/users               - Get all users (admin)
GET    /api/users/:id           - Get user by ID
PUT    /api/users/:id           - Update user
DELETE /api/users/:id           - Delete user (admin)
PUT    /api/users/:id/deactivate - Deactivate user
```

### Shipment Endpoints

```
POST   /api/shipments           - Create shipment
GET    /api/shipments           - Get all shipments
GET    /api/shipments/:id       - Get shipment by ID
PUT    /api/shipments/:id       - Update shipment status
DELETE /api/shipments/:id       - Cancel shipment
```

### Transaction Endpoints

```
POST   /api/transactions        - Create payment
GET    /api/transactions        - Get all transactions (admin)
GET    /api/transactions/:id    - Get transaction by ID
PUT    /api/transactions/:id/confirm - Confirm payment
PUT    /api/transactions/:id/refund  - Refund payment (admin)
```

### Tracking Endpoints

```
GET    /api/tracking/:trackingNumber           - Get tracking by number
GET    /api/tracking/shipment/:shipmentId      - Get tracking history
POST   /api/tracking/:shipmentId/update        - Update tracking location (courier)
GET    /api/tracking/stats                     - Get tracking statistics (admin)
```

## 🔐 Authentication

Tampilkan Authorization header dengan Bearer token:

```
Authorization: Bearer <your_jwt_token>
```

## 🔌 Socket.io Events

### Client Events

```javascript
// Join tracking room
socket.emit('join_tracking', {
  trackingNumber: 'PKG-123456',
  userId: 'user-id'
});

// Send location update
socket.emit('location_update', {
  trackingNumber: 'PKG-123456',
  latitude: -6.2088,
  longitude: 106.8456,
  status: 'in_transit'
});

// Send status update
socket.emit('status_update', {
  trackingNumber: 'PKG-123456',
  status: 'delivered',
  description: 'Package delivered'
});

// Leave tracking room
socket.emit('leave_tracking', {
  trackingNumber: 'PKG-123456'
});
```

### Server Events

```javascript
// Receive tracking update
socket.on('tracking_update', (data) => {
  console.log('Tracking updated:', data);
});

// Error notification
socket.on('error', (error) => {
  console.error('Error:', error.message);
});
```

## 💳 Payment Integration (Midtrans)

### Setup Midtrans

1. Daftar di [Midtrans](https://midtrans.com)
2. Dapatkan Server Key dan Client Key
3. Tambahkan ke `.env`

### Payment Flow

```
1. Customer membuat shipment
2. System membuat transaction
3. Customer melakukan pembayaran melalui Midtrans Snap
4. Midtrans mengirim webhook notification
5. System update transaction status
6. Shipment siap untuk pickup
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.js
```

## 📦 Available Scripts

```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm run migrate      # Run database migrations
npm run seed         # Seed database with dummy data
npm test             # Run tests
npm run lint         # Run ESLint
```

## 🔄 Database Relationships

```
User (1) ──────→ (*) Address
  ↓
  └──→ (*) Shipment (as sender)
  └──→ (*) Shipment (as courier)
  └──→ (*) Transaction

Shipment ──────→ (*) ShipmentItem
   ↓
   └──→ (*) TrackingHistory
   └──→ (1) Transaction
   └──→ (1) Address (pickup)
   └──→ (1) Address (delivery)
   └──→ (1) User (sender)
   └──→ (1) User (courier, optional)

Transaction ──────→ (1) Shipment
   ↓
   └──→ (1) User
```

## 🛡️ Security Features

- ✅ JWT authentication
- ✅ Password hashing dengan bcrypt
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Input validation
- ✅ SQL injection prevention (Sequelize ORM)
- ✅ Error handling yang aman (tidak expose sensitive data)
- ✅ Helmet.js untuk HTTP headers security

## 📝 Environment Variables

Lihat `.env.example` untuk semua environment variables yang tersedia.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

Dharma Saprian - [@dharmasaprian18-ship-it](https://github.com/dharmasaprian18-ship-it)

## 📞 Support

Untuk pertanyaan atau dukungan, silakan buka issue di repository ini.

---

**Made with ❤️ for Paket Express Courier System**
