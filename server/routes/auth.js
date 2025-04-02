const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendResetPasswordEmail } = require('../utils/email');
const bcrypt = require('bcryptjs');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          message: errors.array()[0].msg 
        });
      }

      const { name, email, password } = req.body;

      // Check if user already exists with more detailed error
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ 
          success: false,
          message: 'An account with this email already exists' 
        });
      }

      // Create new user
      user = new User({
        name,
        email,
        password
      });

      await user.save();
      
      const payload = {
        user: { id: user.id }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '24h' },
        (err, token) => {
          if (err) throw err;
          const userData = {
            id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
            role: user.role
          };
          res.json({ 
            success: true,
            token, 
            user: userData 
          });
        }
      );

    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ 
        success: false,
        message: 'Server error during registration' 
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').exists().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Check if user exists
      console.log('Login attempt - Email:', email);
      const user = await User.findOne({ email });
      if (!user) {
        console.log('Login failed - User not found');
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
      console.log('User found:', {
        id: user._id,
        email: user.email,
        hasPassword: !!user.password
      });

      // Check password using the model's method
      console.log('Attempting password comparison...');
      try {
        // Direct password comparison for debugging
        const directMatch = await bcrypt.compare(password, user.password);
        console.log('Direct bcrypt comparison result:', directMatch);
        
        // Model method comparison
        const isMatch = await user.comparePassword(password);
        console.log('Model comparePassword result:', isMatch);

        if (!isMatch) {
          console.log('Login failed - Password does not match');
          return res.status(400).json({ msg: 'Invalid credentials' });
        }
        console.log('Password matched successfully');

        // Create token
        const payload = {
          user: {
            id: user.id
          }
        };

        jwt.sign(
          payload,
          process.env.JWT_SECRET,
          { expiresIn: '24h' },
          (err, token) => {
            if (err) throw err;
            // Include user data in response (excluding password)
            const userData = {
              id: user._id,
              name: user.name,
              email: user.email,
              profilePicture: user.profilePicture,
              role: user.role
            };
            console.log('Login successful - Sending response');
            res.json({ token, user: userData });
          }
        );
      } catch (error) {
        console.error('Password comparison error:', error);
        res.status(500).json({ msg: 'Error during authentication' });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password',
  [body('email').isEmail().withMessage('Please enter a valid email')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate reset token
      const resetToken = user.getResetPasswordToken();
      await user.save();

      // Send email
      try {
        await sendResetPasswordEmail(user.email, resetToken);
        res.json({ message: 'Password reset email sent' });
      } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        return res.status(500).json({ message: 'Email could not be sent' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   PUT /api/auth/reset-password/:token
// @desc    Reset password
// @access  Public
router.put('/reset-password/:token',
  [
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Get hashed token
      const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

      const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }

      // Set new password
      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      res.json({ message: 'Password updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('name').trim().optional(),
  body('email').isEmail().optional(),
  body('username').trim()
    .optional()
    .custom(async (value, { req }) => {
      if (!value) return true;
      const user = await User.findOne({ username: value });
      if (user && user._id.toString() !== req.user.id) {
        throw new Error('Username is already taken');
      }
      return true;
    }),
  body('bio').trim().optional(),
  body('location').trim().optional(),
  body('phoneNumber').trim().optional(),
  body('occupation').trim().optional(),
  body('skills').isArray().optional(),
  body('socialLinks').isObject().optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: errors.array()[0].msg 
      });
    }

    const updateFields = {
      ...req.body
    };

    // Remove undefined fields
    Object.keys(updateFields).forEach(key => 
      updateFields[key] === undefined && delete updateFields[key]
    );

    // Check if username is valid (only alphanumeric and underscore)
    if (updateFields.username) {
      if (!/^[a-zA-Z0-9_]+$/.test(updateFields.username)) {
        return res.status(400).json({
          success: false,
          message: 'Username can only contain letters, numbers and underscores'
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      user
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.json({
      success: true,
      user
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

module.exports = router;