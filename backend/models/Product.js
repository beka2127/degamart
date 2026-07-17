import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, enum: ['Tech', 'General'] },
  location: { type: String, default: '' },
  available: { type: Boolean, default: true },
  soldOutMessage: { type: String, default: '' },
  reviews: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      username: { type: String, required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String, default: '' },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  imageUrl: { type: String, default: '' },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Product', productSchema);
