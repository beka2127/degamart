// In-memory "database" for rapid prototyping.
// Implements the same interface as db/mongoRepo.js so the rest of the app
// never has to know which driver is active (see db/index.js).

import { v4 as uuidv4 } from 'uuid';

const users = [];
const products = [];

const clone = (obj) => (obj ? JSON.parse(JSON.stringify(obj)) : obj);

// ---------- Users ----------
const userRepo = {
  async create(userData) {
    const user = {
      _id: uuidv4(),
      username: userData.username,
      email: userData.email.toLowerCase(),
      password: userData.password, // already hashed by controller
      phoneNumber: userData.phoneNumber || '',
      telegram: userData.telegram || '',
      facebook: userData.facebook || '',
      role: userData.role || 'seller',
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    return clone(user);
  },

  async findByEmail(email) {
    const user = users.find((u) => u.email === email.toLowerCase());
    return clone(user) || null;
  },

  async findById(id) {
    const user = users.find((u) => u._id === id);
    return clone(user) || null;
  },

  async update(id, updates) {
    const idx = users.findIndex((u) => u._id === id);
    if (idx === -1) return null;
    const updatedUser = {
      ...users[idx],
      ...updates,
      email: updates.email ? updates.email.toLowerCase() : users[idx].email,
    };
    users[idx] = updatedUser;
    return clone(updatedUser);
  },
};

// ---------- Products ----------
const productRepo = {
  async create(productData) {
    const product = {
      _id: uuidv4(),
      title: productData.title,
      description: productData.description,
      price: productData.price,
      category: productData.category,
      location: productData.location || '',
      available: productData.available !== undefined ? productData.available : true,
      soldOutMessage: productData.soldOutMessage || '',
      reviews: productData.reviews || [],
      imageUrl: productData.imageUrl || '',
      sellerId: productData.sellerId,
      createdAt: new Date().toISOString(),
    };
    products.push(product);
    return clone(product);
  },

  // filters: { search, category, sellerId }
  async find(filters = {}) {
    let result = [...products];

    if (filters.sellerId) {
      result = result.filter((p) => p.sellerId === filters.sellerId);
    }
    if (filters.category && filters.category !== 'All') {
      result = result.filter(
        (p) => p.category.toLowerCase() === filters.category.toLowerCase()
      );
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return clone(result);
  },

  async findById(id) {
    const product = products.find((p) => p._id === id);
    return clone(product) || null;
  },

  async update(id, updates) {
    const idx = products.findIndex((p) => p._id === id);
    if (idx === -1) return null;
    products[idx] = { ...products[idx], ...updates };
    return clone(products[idx]);
  },

  async delete(id) {
    const idx = products.findIndex((p) => p._id === id);
    if (idx === -1) return false;
    products.splice(idx, 1);
    return true;
  },
};

export default { userRepo, productRepo };
