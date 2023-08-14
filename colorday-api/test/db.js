const db = require('../db');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const clearData = async () => {
    try {
        await User.deleteMany({});

        const newUser = new User({
            username: 'logintestuser',
            email: 'logintestuser@example.com',
            password: await bcrypt.hash('logintestpw', 10),
        });
        await newUser.save();
    } catch (error) {
        console.error('Error clearing data:', error);
    }
};

module.exports = {
    connectTestDb: db.connectTestDb,
    disconnect: db.disconnect,
    clearData,
};