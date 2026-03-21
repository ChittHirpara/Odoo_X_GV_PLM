const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 * No auth required
 */
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  console.log('[ROUTE] POST /api/auth/login called');

  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array().map(e => e.msg).join(', ')
      });
    }

    const { email, password } = req.body;

    // Find user by email (include password for comparison)
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT
    const payload = {
      id: user._id,
      name: user.name,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    console.log(`[AUTH] User logged in: ${user.email} (${user.role})`);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    console.error('[AUTH] Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
});

module.exports = router;
