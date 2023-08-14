const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

const db = require('./db');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api', (req, res) => {
    res.send('Hello, ColorDay API');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const apiRouter = require('./routes/api');
app.use('/api', apiRouter);

module.exports = app;