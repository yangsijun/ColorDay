const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/change-password', authController.authenticateToken, authController.changePassword);
router.get('/authenticate', authController.authenticateToken, (req, res) => res.status(200).json({ message: 'Authenticated' }));

module.exports = router;