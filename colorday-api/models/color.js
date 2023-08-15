const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: String,
        required: true,
    },
    colorCode: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    }
});

const Color = mongoose.model('Color', colorSchema);

module.exports = Color;