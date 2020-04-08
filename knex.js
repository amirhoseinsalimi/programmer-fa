const {
  NODE_ENV: env,
} = require('./env');

const environment = env || 'development';
const config = require('./knexfile.js')[environment];

module.exports = require('knex')(config);
