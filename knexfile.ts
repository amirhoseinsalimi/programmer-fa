/* Knex.js configuration
   See http://knexjs.org/ for documents
* */
import envs from './env';

module.exports = {
  development: {
    client: envs.DB_DRIVER || 'mysql',
    connection: {
      database: envs.DB_NAME,
      user: envs.DB_USERNAME,
      password: envs.DB_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: `${__dirname}/knex/migrations`,
    },
    seeds: {
      directory: `${__dirname}/knex/seeds`,
    },
  },

  production: {
    client: 'client' || 'mysql',
    connection: {
      database: envs.DB_NAME,
      user: envs.DB_USERNAME,
      password: envs.DB_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: `${__dirname}/knex/migrations`,
    },
    seeds: {
      directory: `${__dirname}/knex/seeds`,
    },
  },
};
