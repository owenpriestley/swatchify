// server.js //

// gimme deets //
require('dotenv').config();

// declare dependencies //

const express = require('express');
//const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const db = require('./config/db');
const app = express();

// specify a port (8000) and start listening //
const port = 8000;

//tell server to use body-parser //
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('site'));
app.use('/js/', express.static(__dirname + '/node_modules/'));

app.listen(port, () => {
    require('./app/routes')(app,);
    console.log('Stayin alive on port ' + port);
});


// connect to MongoDB //

/*MongoClient.connect(db.url, (err, database) => {
    if (err) return console.log(err)
    require('./app/routes')(app, database);
    app.listen(port, () => {
        console.log('Stayin alive on port ' + port);
    });
}) */