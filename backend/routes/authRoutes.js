const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/authController');

// ...existing code...

// Login route
router.post('/login', loginUser);

// ...existing code...

module.exports = router;
