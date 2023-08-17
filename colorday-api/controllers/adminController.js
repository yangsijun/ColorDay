const bcrypt = require('bcrypt');
const saltRound = require('../config/bcryptConfig.json').saltRound;
const Admin = require('../models/admin');
const User = require('../models/user');
const authController = require('../controllers/authController');
const ADMIN_NAMES = require('../config/adminConfig.json').ADMIN_NAMES;

async function createAdmin(req, res) {
    try {
        const { adminname, password } = req.body;
        
        // await Admin.deleteMany({});
        const existingAdmin = await Admin.findOne({ adminname });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        if (!ADMIN_NAMES.includes(adminname)) {
            return res.status(400).json({ message: 'Not a registered admin account' });
        }

        const hashedPassword = await bcrypt.hash(password, saltRound);

        const newAdmin = new Admin({
            adminname,
            password: hashedPassword,
            passwordChangedAt: new Date().toString()
        });

        await newAdmin.save();

        console.log(newAdmin._id);

        const adminToken = authController.generateAdminToken(newAdmin);
        res.status(201).json({ message: 'Admin created', token: adminToken });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}

async function getUsers(req, res) {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
}

async function getUserById(req, res) {
    try {
        const userId = req.params.id;
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
        
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}

async function updateUser(req, res) {
    try {
        const userId = req.params.id;
        const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user' });
    }
}

async function deleteUser(req, res) {
    try {
        const userId = req.params.id;
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
}

async function changeUserPassword(req, res) {
    try {
        const userId = req.params.id;
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

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}

module.exports = {
    createAdmin,
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    changeUserPassword
};