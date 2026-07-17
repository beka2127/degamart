import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepo } from '../db/index.js';

const signToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const sanitizeUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  phoneNumber: user.phoneNumber,
  telegram: user.telegram,
  facebook: user.facebook,
  role: user.role,
});

export const signup = async (req, res) => {
  try {
    const { username, email, password, phoneNumber, telegram, facebook } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email and password are required.' });
    }

    const existing = await userRepo.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userRepo.create({
      username,
      email,
      password: hashedPassword,
      phoneNumber,
      telegram,
      facebook,
      role: 'seller',
    });

    const token = signToken(user);
    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during signup.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await userRepo.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken(user);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

export const getMe = async (req, res) => {
  const user = await userRepo.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json({ user: sanitizeUser(user) });
};

export const updateProfile = async (req, res) => {
  try {
    const { username, email, phoneNumber, telegram, facebook } = req.body;

    if (!username || !email) {
      return res.status(400).json({ message: 'Username and email are required.' });
    }

    const existing = await userRepo.findByEmail(email);
    if (existing && existing._id !== req.user.id) {
      return res.status(409).json({ message: 'That email is already taken.' });
    }

    const updates = {
      username,
      email: email.toLowerCase(),
      phoneNumber: phoneNumber || '',
      telegram: telegram || '',
      facebook: facebook || '',
    };

    const user = await userRepo.update(req.user.id, updates);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const token = signToken(user);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
};
