import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  getProducts,
  getProductById,
  getMyProducts,
  addProductReview,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { requireAuth } from '../middleware/auth.js';

const uploadPath = path.resolve(process.cwd(), 'uploads');
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => {
      const sanitized = file.originalname.replace(/\s+/g, '_');
      cb(null, `${Date.now()}-${sanitized}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (/^image\//.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image uploads are allowed.'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/mine/listings', requireAuth, getMyProducts); // must precede /:id
router.get('/:id', getProductById);

// Protected routes (seller must be logged in)
router.post('/', requireAuth, upload.single('image'), createProduct);
router.post('/:id/review', requireAuth, addProductReview);
router.put('/:id', requireAuth, upload.single('image'), updateProduct);
router.delete('/:id', requireAuth, deleteProduct);

export default router;
