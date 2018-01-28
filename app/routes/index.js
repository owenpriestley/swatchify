// routes/index.js

const contentRoutes = require('./content_routes');
module.exports = function(app, db) {
  contentRoutes(app, db);
};
