const moment = require('moment');
const Color = require('../models/color');

async function getColors(req, res) {
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

        if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
            return res.status(400).json({ message: 'Invalid date format' });
        }

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

        if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
            return res.status(400).json({ message: 'Invalid date format' });
        }

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

        if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
            return res.status(400).json({ message: 'Invalid date format' });
        }

        const deletedColor = await Color.findOneAndDelete({ userId, date });
        if (!deletedColor) {
            return res.status(404).json({ message: 'Color not found' });
        }

        res.status(200).json({ message: 'Color deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}

async function getColorsByDateRange(req, res) {
    try {
        const userId = req.userId;
        const { startDate, endDate } = req.query;

        if (!moment(startDate, 'YYYY-MM-DD', true).isValid() || !moment(endDate, 'YYYY-MM-DD', true).isValid()) {
            return res.status(400).json({ message: 'Invalid date format' });
        }

        const colors = await Color.find({
            userId,
            date: { $gte: startDate, $lte: endDate }
        });

        res.status(200).json(colors);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}

module.exports = {
    getColors,
    createColor,
    updateColor,
    deleteColor,
    getColorsByDateRange
};