const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

router.get('/', authController.authenticateToken, userController.getUser);

router.post('/', userController.createUser);

router.put('/', authController.authenticateToken, userController.updateUser);

router.delete('/', authController.authenticateToken, userController.deleteUser);

module.exports = router;