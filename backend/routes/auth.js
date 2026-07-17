import express from 'express';
import { signup, login, getMe, updateProfile } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', requireAuth, getMe);
router.put('/profile', requireAuth, updateProfile);

export default router;
