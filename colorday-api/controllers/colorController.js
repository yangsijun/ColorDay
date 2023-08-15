const bcrypt = require('bcrypt');
const Color = require('../models/color');


async function getColorsByUser(req, res) {
    try {
        const userId = req.userId;

        const color = await Color.find({ userId: userId });
        if (!color) {
            return res.status(404).json({ message: 'Color not found' });
        }

        res.status(200).json(color);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}

async function createColor(req, res) {
    try {
        const userId = req.userId;
        const { date, colorCode, description } = req.body;

        const newColor = new Color({
            userId,
            date,
            colorCode,
            description
        });

        await newColor.save();
        res.status(201).json(newColor);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}

async function updateColor(req, res) {
    try {
        const userId = req.userId;
        const { date, colorCode, description } = req.body;

        const updatedColor = await Color.findOneAndUpdate(
            { userId, date },
            { colorCode, description },
            { new: true }
        );

        if (!updatedColor) {
            return res.status(404).json({ message: 'Color not found' });
        }

        res.status(200).json(updatedColor);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}

async function deleteColor(req, res) {
    try {
        const userId = req.userId;
        const date = req.query.date;

        const deletedColor = await Color.findOneAndDelete({ userId, date });
        if (!deletedColor) {
            return res.status(404).json({ message: 'Color not found' });
        }

        res.status(200).json({ message: 'Color deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}

module.exports = {
    getColorsByUser,
    createColor,
    updateColor,
    deleteColor
};