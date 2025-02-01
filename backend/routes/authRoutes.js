// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authCOntroller');

router.post('/login', authController.login);
router.get('/logout', authController.logout);

module.exports = router;
