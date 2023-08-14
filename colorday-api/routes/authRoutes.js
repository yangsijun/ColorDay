const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);

router.get('/tokenValidation', authController.verifyToken);

module.exports = router;