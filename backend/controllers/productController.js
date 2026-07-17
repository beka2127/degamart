import { productRepo, userRepo } from '../db/index.js';

// GET /api/products?search=&category=  (public)
export const getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    const products = await productRepo.find({ search, category });
    res.json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch products.' });
  }
};

// GET /api/products/:id  (public) - includes seller contact details
export const getProductById = async (req, res) => {
  try {
    const product = await productRepo.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    const seller = await userRepo.findById(product.sellerId);

    res.json({
      product: {
        ...product,
        seller: seller
          ? {
              username: seller.username,
              email: seller.email,
              phoneNumber: seller.phoneNumber || null,
              telegram: seller.telegram || null,
              facebook: seller.facebook || null,
            }
          : null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch product.' });
  }
};

// GET /api/products/mine/listings  (protected) - current seller's listings
export const getMyProducts = async (req, res) => {
  try {
    const products = await productRepo.find({ sellerId: req.user.id });
    res.json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch your listings.' });
  }
};

// POST /api/products/:id/review  (protected)
export const addProductReview = async (req, res) => {
  try {
    const product = await productRepo.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    const { rating, comment } = req.body;
    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
    }

    const existingReviewIndex = product.reviews?.findIndex(
      (review) => String(review.userId) === String(req.user.id)
    );

    const reviewPayload = {
      userId: req.user.id,
      username: req.user.username,
      rating: numericRating,
      comment: comment?.trim() || '',
      createdAt: new Date().toISOString(),
    };

    const reviews = product.reviews || [];
    if (existingReviewIndex >= 0) {
      reviews[existingReviewIndex] = { ...reviews[existingReviewIndex], ...reviewPayload };
    } else {
      reviews.push(reviewPayload);
    }

    const updatedProduct = await productRepo.update(req.params.id, { reviews });
    res.json({ product: updatedProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to submit review.' });
  }
};

// POST /api/products  (protected)
export const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, location, available, soldOutMessage } = req.body;
    const imageUrl = req.file
      ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
      : '';

    if (!title || !description || price === undefined || !category) {
      return res.status(400).json({ message: 'Title, description, price and category are required.' });
    }

    const product = await productRepo.create({
      title,
      description,
      price: Number(price),
      category,
      location: location || '',
      available: available === undefined ? true : available === 'true' || available === true,
      soldOutMessage: soldOutMessage || '',
      imageUrl,
      sellerId: req.user.id,
    });

    res.status(201).json({ product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create listing.' });
  }
};

// PUT /api/products/:id  (protected, owner only)
export const updateProduct = async (req, res) => {
  try {
    const existing = await productRepo.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Product not found.' });

    if (String(existing.sellerId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'You can only edit your own listings.' });
    }

    const { title, description, price, category, location, available, soldOutMessage } = req.body;
    const updates = {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price: Number(price) }),
      ...(category !== undefined && { category }),
      ...(location !== undefined && { location }),
      ...(available !== undefined && { available: available === 'true' || available === true }),
      ...(soldOutMessage !== undefined && { soldOutMessage }),
    };

    if (req.file) {
      updates.imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const product = await productRepo.update(req.params.id, updates);
    res.json({ product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update listing.' });
  }
};

// DELETE /api/products/:id  (protected, owner only)
export const deleteProduct = async (req, res) => {
  try {
    const existing = await productRepo.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Product not found.' });

    if (String(existing.sellerId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'You can only delete your own listings.' });
    }

    await productRepo.delete(req.params.id);
    res.json({ message: 'Listing deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete listing.' });
  }
};
