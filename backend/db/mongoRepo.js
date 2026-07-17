// Mongoose-backed implementation of the same repo interface as mockDb.js.
// Swap DB_DRIVER=mongo in .env to activate this instead of the in-memory store.

import User from '../models/User.js';
import Product from '../models/Product.js';

const userRepo = {
  async create(userData) {
    const user = await User.create(userData);
    return user.toObject();
  },
  async findByEmail(email) {
    const user = await User.findOne({ email: email.toLowerCase() });
    return user ? user.toObject() : null;
  },
  async findById(id) {
    const user = await User.findById(id);
    return user ? user.toObject() : null;
  },
  async update(id, updates) {
    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    return user ? user.toObject() : null;
  },
};

const productRepo = {
  async create(productData) {
    const product = await Product.create(productData);
    return product.toObject();
  },
  async find(filters = {}) {
    const query = {};
    if (filters.sellerId) query.sellerId = filters.sellerId;
    if (filters.category && filters.category !== 'All') query.category = filters.category;
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }
    const products = await Product.find(query).sort({ createdAt: -1 });
    return products.map((p) => p.toObject());
  },
  async findById(id) {
    const product = await Product.findById(id);
    return product ? product.toObject() : null;
  },
  async update(id, updates) {
    const product = await Product.findByIdAndUpdate(id, updates, { new: true });
    return product ? product.toObject() : null;
  },
  async delete(id) {
    const res = await Product.findByIdAndDelete(id);
    return !!res;
  },
};

export default { userRepo, productRepo };
