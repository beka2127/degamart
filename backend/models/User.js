import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }, // stored hashed
  phoneNumber: { type: String, default: '' },
  telegram: { type: String, default: '' },
  facebook: { type: String, default: '' },
  role: { type: String, default: 'seller' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', userSchema);
