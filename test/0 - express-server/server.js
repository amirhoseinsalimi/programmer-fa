const express = require('express');
const routes = require('./routes');

const createServer = () => {
  const app = express();

  app.use('/', routes);

  return app;
};

module.exports = createServer;
