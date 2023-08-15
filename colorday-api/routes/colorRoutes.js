const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const colorController = require('../controllers/colorController');

router.use(authController.authenticateToken);

router.get('/', colorController.getColorsByUser);

router.post('/', colorController.createColor);

router.put('/', colorController.updateColor);

router.delete('/', colorController.deleteColor);

module.exports = router;