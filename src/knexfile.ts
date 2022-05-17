/* Knex.js configuration
   See http://knexjs.org/ for documents
* */
import envs from './env';

module.exports = {
  development: {
    client: envs.DB_DRIVER || 'mysql',
    connection: {
      host: envs.DB_HOST,
      port: envs.DB_PORT,
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
      directory: `${__dirname}/database/migrations`,
    },
    seeds: {
      directory: `${__dirname}/database/seeds`,
    },
  },

  production: {
    client: envs.DB_DRIVER || 'mysql',
    connection: {
      host: envs.DB_HOST,
      port: envs.DB_PORT,
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
      directory: `${__dirname}/database/migrations`,
    },
    seeds: {
      directory: `${__dirname}/database/seeds`,
    },
  },
};
