# Marketli — Lightweight Marketplace

A full-stack marketplace app: buyers browse freely with no account, sellers
log in to create/edit/delete their own listings.

## Stack
- Frontend: React + Vite + Tailwind CSS + lucide-react
- Backend: Node.js + Express + JWT auth
- Database: swappable — in-memory mock (default, zero setup) or MongoDB/Mongoose

## Project structure
```
marketplace/
  backend/
    config/db.js          # Mongoose connection
    db/
      index.js            # picks driver based on DB_DRIVER env var
      mockDb.js            # in-memory implementation
      mongoRepo.js          # Mongoose implementation (same interface)
    models/                # Mongoose schemas (User, Product)
    middleware/auth.js     # JWT auth middleware
    controllers/            # auth + product logic
    routes/                 # /api/auth, /api/products
    server.js
  frontend/
    src/
      api/axios.js          # axios instance w/ JWT interceptor
      context/AuthContext.jsx
      components/           # Navbar, ProductCard, ProductModal, ListingForm, ProtectedRoute
      pages/                 # Home, Login, Signup, Dashboard
      App.jsx, main.jsx
```

## Running locally

### 1. Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev        # or: npm start
```
Runs on http://localhost:5000. Uses the in-memory mock DB by default —
data resets whenever the server restarts. To use real MongoDB instead,
set `DB_DRIVER=mongo` and `MONGO_URI=...` in `.env`.

### 2. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Runs on http://localhost:5173 and talks to the backend at the URL in
`VITE_API_URL`.

## Swapping the database
The backend never imports Mongoose models directly outside of
`db/mongoRepo.js`. Everything else calls `userRepo` / `productRepo` from
`db/index.js`, so switching from the mock store to MongoDB is a single
environment variable (`DB_DRIVER=mongo`) — no application code changes.

## API summary
| Method | Route                     | Auth | Description                          |
|--------|---------------------------|------|---------------------------------------|
| POST   | /api/auth/signup          | No   | Create a seller account               |
| POST   | /api/auth/login           | No   | Log in, returns JWT                   |
| GET    | /api/auth/me              | Yes  | Current user profile                  |
| GET    | /api/products             | No   | List/search/filter products           |
| GET    | /api/products/:id         | No   | Product detail + seller contact info  |
| GET    | /api/products/mine/listings | Yes | Current seller's own listings       |
| POST   | /api/products             | Yes  | Create a listing                      |
| PUT    | /api/products/:id         | Yes  | Update own listing                    |
| DELETE | /api/products/:id         | Yes  | Delete own listing                    |
