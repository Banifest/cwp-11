const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const apiFilms = require('./films');
const apiActors = require('./actors');


const app = express.Router();

app.use('/films', apiFilms);
app.use('/actors', apiActors);

app.all('/*', (req, res, next) =>
{
    fs.appendFile('log.log', `{"data":${new Date()},\n "params":${JSON.stringify(req.query)},\n "path":${req.originalUrl}}\n\n\n`);
    next();
});

module.exports = app;
