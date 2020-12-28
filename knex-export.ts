import * as Knex from 'knex';

const {
  NODE_ENV: env,
} = require('./env');

const environment = env || 'development';
const config = require('./knexfile')[environment];

export default Knex(config);
