import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.resolve(__dirname, '../../data.sqlite');

let db;

const initDb = async () => {
  if (db) return;
  db = await open({ filename: DB_FILE, driver: sqlite3.Database });
  await db.run('PRAGMA foreign_keys = ON');

  await db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT,
      email TEXT UNIQUE,
      password TEXT,
      phoneNumber TEXT,
      telegram TEXT,
      facebook TEXT,
      role TEXT,
      createdAt TEXT
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      title TEXT,
      description TEXT,
      price REAL,
      category TEXT,
      location TEXT,
      available INTEGER,
      soldOutMessage TEXT,
      reviews TEXT,
      imageUrl TEXT,
      sellerId TEXT,
      createdAt TEXT,
      FOREIGN KEY(sellerId) REFERENCES users(id)
    )
  `);
};

const toUser = (row) =>
  row
    ? {
        _id: row.id,
        username: row.username,
        email: row.email,
        password: row.password,
        phoneNumber: row.phoneNumber,
        telegram: row.telegram,
        facebook: row.facebook,
        role: row.role,
        createdAt: row.createdAt,
      }
    : null;

const toProduct = (row) =>
  row
    ? {
        _id: row.id,
        title: row.title,
        description: row.description,
        price: row.price,
        category: row.category,
        location: row.location,
        available: !!row.available,
        soldOutMessage: row.soldOutMessage || '',
        reviews: row.reviews ? JSON.parse(row.reviews) : [],
        imageUrl: row.imageUrl || '',
        sellerId: row.sellerId,
        createdAt: row.createdAt,
      }
    : null;

const userRepo = {
  async create(userData) {
    await initDb();
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    await db.run(
      `INSERT INTO users (id, username, email, password, phoneNumber, telegram, facebook, role, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userData.username,
        (userData.email || '').toLowerCase(),
        userData.password,
        userData.phoneNumber || '',
        userData.telegram || '',
        userData.facebook || '',
        userData.role || 'seller',
        createdAt,
      ]
    );
    return toUser({ id, username: userData.username, email: (userData.email || '').toLowerCase(), password: userData.password, phoneNumber: userData.phoneNumber || '', telegram: userData.telegram || '', facebook: userData.facebook || '', role: userData.role || 'seller', createdAt });
  },

  async findByEmail(email) {
    await initDb();
    const row = await db.get(`SELECT * FROM users WHERE email = ?`, (email || '').toLowerCase());
    return toUser(row);
  },

  async findById(id) {
    await initDb();
    const row = await db.get(`SELECT * FROM users WHERE id = ?`, id);
    return toUser(row);
  },

  async update(id, updates) {
    await initDb();
    const sets = [];
    const params = [];
    for (const [key, value] of Object.entries(updates)) {
      if (key === 'email') {
        sets.push('email = ?');
        params.push((value || '').toLowerCase());
      } else {
        sets.push(`${key} = ?`);
        params.push(value);
      }
    }
    if (!sets.length) return await userRepo.findById(id);
    params.push(id);
    await db.run(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, params);
    return await userRepo.findById(id);
  },
};

const productRepo = {
  async create(productData) {
    await initDb();
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    const reviewsJson = productData.reviews ? JSON.stringify(productData.reviews) : JSON.stringify([]);
    await db.run(
      `INSERT INTO products (id, title, description, price, category, location, available, soldOutMessage, reviews, imageUrl, sellerId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        productData.title,
        productData.description,
        productData.price || 0,
        productData.category || '',
        productData.location || '',
        productData.available ? 1 : 0,
        productData.soldOutMessage || '',
        reviewsJson,
        productData.imageUrl || '',
        productData.sellerId,
        createdAt,
      ]
    );
    return toProduct({ id, title: productData.title, description: productData.description, price: productData.price || 0, category: productData.category || '', location: productData.location || '', available: productData.available ? 1 : 0, soldOutMessage: productData.soldOutMessage || '', reviews: reviewsJson, imageUrl: productData.imageUrl || '', sellerId: productData.sellerId, createdAt });
  },

  async find(filters = {}) {
    await initDb();
    const clauses = [];
    const params = [];
    if (filters.sellerId) {
      clauses.push('sellerId = ?');
      params.push(filters.sellerId);
    }
    if (filters.category && filters.category !== 'All') {
      clauses.push('LOWER(category) = ?');
      params.push(filters.category.toLowerCase());
    }
    if (filters.search) {
      clauses.push('(LOWER(title) LIKE ? OR LOWER(description) LIKE ?)');
      const q = `%${filters.search.toLowerCase()}%`;
      params.push(q, q);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const rows = await db.all(`SELECT * FROM products ${where} ORDER BY datetime(createdAt) DESC`, params);
    return rows.map(toProduct);
  },

  async findById(id) {
    await initDb();
    const row = await db.get(`SELECT * FROM products WHERE id = ?`, id);
    return toProduct(row);
  },

  async update(id, updates) {
    await initDb();
    const sets = [];
    const params = [];
    for (const [key, value] of Object.entries(updates)) {
      if (key === 'reviews') {
        sets.push('reviews = ?');
        params.push(JSON.stringify(value));
      } else if (key === 'available') {
        sets.push('available = ?');
        params.push(value ? 1 : 0);
      } else {
        sets.push(`${key} = ?`);
        params.push(value);
      }
    }
    if (sets.length === 0) return await productRepo.findById(id);
    const sql = `UPDATE products SET ${sets.join(', ')} WHERE id = ?`;
    params.push(id);
    await db.run(sql, params);
    return await productRepo.findById(id);
  },

  async delete(id) {
    await initDb();
    const res = await db.run(`DELETE FROM products WHERE id = ?`, id);
    return res.changes > 0;
  },
};

export default { userRepo, productRepo };
