import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import { initDb } from './db/index.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';

const app = express();
const PORT = process.env.PORT || 5000;
const uploadsDir = path.resolve(process.cwd(), 'uploads');

// --- Middleware ---
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// --- Routes ---
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// --- 404 handler ---
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

// --- Global error handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

const start = async () => {
  await initDb();

  // Try configured port, and if it's in use try the next few ports.
  let port = Number(process.env.PORT) || 5000;
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const server = await new Promise((resolve, reject) => {
        const s = app.listen(port, () => resolve(s));
        s.on('error', reject);
      });

      console.log(`Server running on http://localhost:${port}`);

      server.on('error', (err) => {
        console.error(err);
        process.exit(1);
      });

      return; // started successfully
    } catch (err) {
      if (err && err.code === 'EADDRINUSE') {
        console.warn(`Port ${port} is in use, trying port ${port + 1}...`);
        port += 1;
        continue;
      }
      console.error('Failed to start server:', err);
      process.exit(1);
    }
  }

  console.error(`Could not find a free port after ${maxAttempts} attempts.`);
  process.exit(1);
};

start();
