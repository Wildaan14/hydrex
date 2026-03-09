# HydrEx Backend - Water Credit Platform API

Backend API untuk platform water credit HydrEx dengan Express.js dan MongoDB.

## 📁 Struktur Folder

```
Backend/
├── src/
│   ├── config/           # Konfigurasi database dan environment
│   ├── controllers/      # Logika handling request
│   ├── middleware/       # Middleware (auth, validation, etc)
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── types/            # TypeScript interfaces
│   ├── utils/           # Helper functions dan constants
│   └── app.ts           # Entry point aplikasi
├── package.json
├── tsconfig.json
└── .env.example
```

## 🚀 Cara Menjalankan

### 1. Install Dependencies

```bash
cd Backend
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
# Edit file .env sesuai konfigurasi Anda
```

### 3. Start MongoDB

Pastikan MongoDB sudah running, atau gunakan MongoDB Atlas.

### 4. Jalankan Development Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:5000`

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Projects

- `GET /api/projects` - Get all projects (with pagination)
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/stats` - Get project statistics
- `PUT /api/projects/:id/verification-step` - Update verification step
- `PUT /api/projects/:id/assign-vvb` - Assign VVB
- `PUT /api/projects/:id/approve` - Approve project
- `PUT /api/projects/:id/reject` - Reject project

### ESG Scoring

- `GET /api/esg` - Get all ESG scorings
- `GET /api/esg/:id` - Get single ESG scoring
- `GET /api/esg/project/:projectId` - Get ESG by project
- `POST /api/esg` - Create ESG scoring
- `PUT /api/esg/:id` - Update ESG scoring
- `PUT /api/esg/:id/indicator/:indicatorId` - Update indicator
- `PUT /api/esg/:id/gate-check` - Update gate check
- `PUT /api/esg/:id/lock` - Lock/Unlock ESG
- `GET /api/esg/stats` - Get ESG statistics

### Marketplace

- `GET /api/marketplace/listings` - Get all listings
- `GET /api/marketplace/listings/:id` - Get single listing
- `POST /api/marketplace/listings` - Create listing
- `PUT /api/marketplace/listings/:id` - Update listing
- `POST /api/marketplace/transactions` - Create transaction
- `GET /api/marketplace/transactions` - Get user transactions
- `GET /api/marketplace/transactions/:id` - Get single transaction
- `GET /api/marketplace/stats` - Get marketplace statistics

## 🔐 Authentication

API menggunakan JWT token untuk authentication.
Include token di header:

```
Authorization: Bearer <token>
```

## 📝 Contoh Request

### Register

```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "company": "PT Example",
  "role": "company"
}
```

### Create Project

```json
POST /api/projects
{
  "title": "Mangrove Restoration Project",
  "description": "Project restore mangrove ecosystem",
  "category": "community",
  "projectType": "mangrove",
  "location": {
    "province": "DKI Jakarta",
    "regency": "Jakarta Utara",
    "district": "Cilincing",
    "village": "Muarah"
  },
  "areaHectares": 100,
  "startDate": "2024-01-01",
  "endDate": "2027-12-31",
  "certificationStandard": "Verra VCS",
  "methodology": "Wetland & Mangrove Restoration"
}
```

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Language**: TypeScript

## 📄 License

MIT
