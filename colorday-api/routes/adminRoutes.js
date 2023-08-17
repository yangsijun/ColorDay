const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');

router.post('/newadmin', adminController.createAdmin);

router.get('/users', authController.authenticateAdmin, adminController.getUsers);

router.get('/users/:id', authController.authenticateAdmin, adminController.getUserById);

router.post('/users/', authController.authenticateAdmin, adminController.createUser);

router.put('/users/:id', authController.authenticateAdmin, adminController.updateUser);

router.delete('/users/:id', authController.authenticateAdmin, adminController.deleteUser);

router.put('/users/:id/change-password', authController.authenticateAdmin, adminController.changeUserPassword);

module.exports = router;