// server.js //
require('dotenv').config();

// declare dependencies //

const express = require('express');
const bodyParser = require('body-parser');
const db = require('./config/db');
const app = express();
const port = 8000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('site'));
app.use('/js/', express.static(__dirname + '/node_modules/'));

app.listen(port, () => {
    require('./app/routes')(app,);
    console.log('Stayin alive on port ' + port);
});