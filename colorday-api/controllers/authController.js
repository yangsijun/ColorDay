const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const jwt_config = require('../config/jwtSecretKey.json');
const SECRET_KEY = jwt_config.SECRET_KEY;

async function login(req, res) {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, SECRET_KEY);

        res.status(200).json({
            message: 'Login successful',
            token: token,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error during login' });
    }
}

async function verifyToken(req, res) {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({ message: 'No token provided' });
        }

        if (!req.headers.authorization.startsWith('Bearer ')) {
            throw invalidTokenError;
        }
        
        const token = req.headers.authorization.split(' ')[1];

        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) {
                throw invalidTokenError;
            }

            return res.status(200).json({ message: 'Token verification successful' });
        });
    } catch (invalidTokenError) {
        return res.status(403).json({ message: 'Failed to authenticate token' });
    }
}

module.exports = {
    login,
    verifyToken
};