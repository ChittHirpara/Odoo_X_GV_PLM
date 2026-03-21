const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roles');

const router = express.Router();

// GET /api/users — List all users
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// GET /api/users/:id — Get single user
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});

// POST /api/users — Create user (Admin only)
router.post('/', authMiddleware, roleMiddleware(['Admin']), async (req, res) => {
  try {
    const { name, email, role, status } = req.body;
    const avatar = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
    const newUser = await User.create({
      id: `u${Date.now()}`,
      name,
      email,
      password: 'password123',
      role,
      avatar,
      status: status || 'Active'
    });
    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    res.status(500).json({ success: false, message: 'Failed to create user' });
  }
});

// PUT /api/users/:id — Update user (Admin only)
router.put('/:id', authMiddleware, roleMiddleware(['Admin']), async (req, res) => {
  try {
    const { name, email, role, status } = req.body;
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) {
      user.name = name;
      user.avatar = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }
    if (email) user.email = email;
    if (role) user.role = role;
    if (status) user.status = status;

    await user.save();
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
});

module.exports = router;

