const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const saltRound = require('../config/bcryptConfig.json').saltRound;
const jwt_config = require('../config/jwtSecretKey.json');
const SECRET_KEY = jwt_config.SECRET_KEY;
const ADMIN_SECRET_KEY = jwt_config.ADMIN_SECRET_KEY;

const User = require('../models/user');
const Admin = require('../models/admin');

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

        const token = generateAccessToken(user);

        res.status(200).json({
            message: 'Login successful',
            token: token,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error during login' });
    }
}

async function changePassword(req, res) {
    try {
        const userId = req.userId;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const passwordMatches = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatches) {
            return res.status(401).json({ message: 'Invalid current password' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, saltRound);
        user.password = hashedNewPassword;
        user.passwordChangedAt = new Date().toString();
        await user.save();

        const token = generateAccessToken(user);
        res.status(200).json({ message: 'Password changed successfully', token });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}

const generateAccessToken = (user) => {
    const payload = {
        id: user._id,
        passwordChangedAt: user.passwordChangedAt
    };

    return jwt.sign(payload, SECRET_KEY);
};

async function authenticateToken(req, res, next) {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({ message: 'No token provided' });
        }
        
        if (!req.headers.authorization.startsWith('Bearer ')) {
            throw new Error('Invalid token format');
        }
        
        const token = req.headers.authorization.split(' ')[1];

        jwt.verify(token, SECRET_KEY, async (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Failed to authenticate token' });
            }
            
            const user = await User.findById(decoded.id);
            
            if (user.passwordChangedAt !== decoded.passwordChangedAt) {
                return res.status(403).json({ message: 'Failed to authenticate token' });
            }
            
            req.userId = decoded.id;
            next();
        });
    } catch (error) {
        return res.status(403).json({ message: 'Failed to authenticate token' });
    }
}

const generateAdminToken = (admin) => {
    const payload = {
        id: admin._id,
        passwordChangedAt: admin.passwordChangedAt
    };

    return jwt.sign(payload, ADMIN_SECRET_KEY);
}

async function authenticateAdmin(req, res, next) {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({ message: 'No token provided' });
        }

        if (!req.headers.authorization.startsWith('Bearer ')) {
            throw new Error('Invalid token format');
        }
        
        const token = req.headers.authorization.split(' ')[1];

        jwt.verify(token, ADMIN_SECRET_KEY, async (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Access denied' });
            }
            const admin = await Admin.findById(decoded.id);
            if (admin.passwordChangedAt !== decoded.passwordChangedAt) {
                return res.status(403).json({ message: 'Failed to authenticate token' });
            }
            // req.admin = decoded;
            next();
        });
    } catch (error) {
        return res.status(403).json({ message: 'Failed to authenticate token' });
    }
}

module.exports = {
    login,
    changePassword,
    generateAccessToken,
    authenticateToken,
    generateAdminToken,
    authenticateAdmin
};