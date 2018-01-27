// routes/content_routes.js
// var ObjectID = require('mongodb').ObjectID;
var request = require('request');
module.exports = function (app, db) {

  app.get('/token', function (req, resp) {

    resp.header('Access-Control-Allow-Origin', '*');
    resp.header('Access-Control-Allow-Headers', 'X-Requested-With');

    var client_id = process.env.SPOTIFY_CLIENT_ID;
    var client_secret = process.env.SPOTIFY_CLIENT_SECRET;

    // your application requests authorization
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        Authorization:
          'Basic ' +
          new Buffer(client_id + ':' + client_secret).toString('base64')
      },
      form: {
        grant_type: 'client_credentials'
      },
      json: true
    };

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        resp.json({ token: body.access_token });
      }
    });
  });


  //Update some content (PUT)
  app.put('content/:id', (req, res) => {
      const id = req.params.id;
      const details = { '_id': new ObjectID(id) };
      const content = { text: req.body.body, title: req.body.title };
      db.collection('content').update(details, content, (err, item) => {
        if (err) {
          res.send({'error':'An error has occurred'});
        } else {
          res.send(content);
        } 
      });
    });
  //Delete some content (DELETE) 
  app.delete('content/:id', (req, res) => {
      const id = req.params.id;
      const details = { '_id': new ObjectID(id) };
      db.collection('content').remove(details, (err, item) => {
        if (err) {
          res.send({'error':'An error has occurred'});
        } else {
          res.send('Content ' + id + ' deleted!');
        } 
      });
    });
  
  //Add some content (POST)
  app.post('/content', (req, res) => {
  const content = { body: req.body.body, title: req.body.title };
  db.collection('content').insert(content, (err, result) => {
  if (err) { 
     res.send({ 'error': 'An error has occurred' }); 
  } else {
       res.send(result.ops[0]);
      }
      });
    }); 
}; 