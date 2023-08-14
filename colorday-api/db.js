const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/colorDay';
const MONGODB_TEST_URI = 'mongodb://localhost:27017/colorDayTest';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const connectTestDb = async () => {
    await mongoose.disconnect();
    await mongoose.connect(MONGODB_TEST_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    return mongoose.connection;
}

const disconnect = async () => {
    await mongoose.disconnect();
};

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

module.exports = {
    connectTestDb,
    disconnect,
};