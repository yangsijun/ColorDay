const bcrypt = require('bcrypt');
const saltRound = require('../config/bcryptConfig.json').saltRound;
const User = require('../models/user');
const { generateAccessToken } = require('./authController');


async function getUser(req, res) {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user' });
    }
}

async function createUser(req, res) {
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, saltRound);

        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            passwordChangedAt: new Date().toString()
        });
        await newUser.save();

        const token = generateAccessToken(newUser);
        res.status(201).json({ user: newUser, token: token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

async function updateUser(req, res) {
    try {
        const userId = req.userId;
        const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user' });
    }
}

async function deleteUser(req, res) {
    try {
        const userId = req.userId;
        const deletedUser = await User.findByIdAndDelete({ _id: userId });
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting user' });
    }
}

module.exports = {
    getUser,
    createUser,
    updateUser,
    deleteUser
};