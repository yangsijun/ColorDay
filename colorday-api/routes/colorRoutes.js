const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const colorController = require('../controllers/colorController');

router.use(authController.authenticateToken);

router.get('/', colorController.getColors);

router.post('/', colorController.createColor);

router.put('/', colorController.updateColor);

router.delete('/', colorController.deleteColor);

router.get('/range', colorController.getColorsByDateRange);

module.exports = router;