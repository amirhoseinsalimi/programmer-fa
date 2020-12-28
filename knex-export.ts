import * as Knex from 'knex';

import envs from './env';

const environment = envs.NODE_ENV || 'development';
const config = require('./knexfile')[environment];

export default Knex(config);
