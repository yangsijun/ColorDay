const db = require('../db');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Color = require('../models/color');
const saltRound = require('../config/bcryptConfig.json').saltRound;

const clearData = async () => {
    try {
        await User.deleteMany({});
        const newUsers = [
            {
                username: 'testuser',
                email: 'testuser@example.com',
                password: await bcrypt.hash('testpassword', saltRound),
            },
            {
                username: 'testuser2',
                email: 'testuser2@example.com',
                password: await bcrypt.hash('testpassword', saltRound),
            }
        ];
        await User.insertMany(newUsers);

        const user = await User.findOne({ email: 'testuser@example.com' });
        const user2 = await User.findOne({ email: 'testuser2@example.com' });
        await Color.deleteMany({});
        const newColors = [
            {
                userId: user._id,
                date: '2023-08-13',
                colorCode: '#32A852',
                description: 'Today is green'
            },
            {
                userId: user._id,
                date: '2023-08-14',
                colorCode: '#6A2694',
                description: 'Today is purple'
            },
            {
                userId: user._id,
                date: '2023-08-15',
                colorCode: '#82482E',
                description: 'Today is Brown'
            },
            {
                userId: user2._id,
                date: '2023-08-14',
                colorCode: '#ffffff',
                description: 'This is invalid case'
            }
        ];
        await Color.insertMany(newColors);

        console.log('Data cleared and initialized successfully.');
    } catch (error) {
        console.error('Error clearing data:', error);
    }
};

module.exports = {
    connectTestDb: db.connectTestDb,
    disconnect: db.disconnect,
    clearData,
};