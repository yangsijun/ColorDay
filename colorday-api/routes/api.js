const express = require('express');
const router = express.Router();

const authRouter = require('./authRoutes');
router.use('/auth', authRouter);

const userRouter = require('./userRoutes');
router.use('/users', userRouter);

const colorRouter = require('./colorRoutes');
router.use('/colors', colorRouter);

module.exports = router;