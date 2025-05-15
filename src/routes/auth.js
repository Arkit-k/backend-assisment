const express = require('express');
const { register, login } = require('../controllers/authController');

const router = express.Router();

/**
 * @route POST /auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', register);

/**
 * @route POST /auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', login);

module.exports = router;
