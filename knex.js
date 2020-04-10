const {
  NODE_ENV: env,
} = require('./dist/env');

const environment = env || 'development';
const config = require('./knexfile.js')[environment];

module.exports = require('knex')(config);
