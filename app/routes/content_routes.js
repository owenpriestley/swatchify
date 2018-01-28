////////////// CONTENT ROUTES ////////////////////

var request = require("request");
module.exports = function(app, db) {
  app.get("/token", function(req, resp) {
    resp.header("Access-Control-Allow-Origin", "*");
    resp.header("Access-Control-Allow-Headers", "X-Requested-With");

    var client_id = process.env.SPOTIFY_CLIENT_ID;
    var client_secret = process.env.SPOTIFY_CLIENT_SECRET;
    var authOptions = {
    
      url: "https://accounts.spotify.com/api/token",
      headers: {
        Authorization:
          "Basic " +
          new Buffer(client_id + ":" + client_secret).toString("base64")
      },
      form: {
        grant_type: "client_credentials"
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        resp.json({ token: body.access_token });
      }
    });
  });
};
