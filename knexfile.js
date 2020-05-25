/* Knex.js configuration
   See http://knexjs.org/ for documents
* */
const {
  DB_NAME: database,
  DB_USERNAME: user,
  DB_PASSWORD: password,
  DB_CLIENT: client
} = require('./env');

module.exports = {
  development: {
    client: client || 'mysql',
    connection: {
      database,
      user,
      password,
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: __dirname + '/knex/migrations',
    },
    seeds: {
      directory: __dirname + '/knex/seeds',
    },
  },

  // staging: {
  //   client: client || 'mysql',
  //   connection: {
  //     database: 'my_db',
  //     user:     'username',
  //     password: 'password'
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10
  //   },
  //   migrations: {
  //     tableName: 'knex_migrations'
  //   }
  // },

  production: {
    client: client || 'mysql',
    connection: {
      database,
      user,
      password,
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: __dirname + '/knex/migrations',
    },
    seeds: {
      directory: __dirname + '/knex/seeds',
    },
  }
};
