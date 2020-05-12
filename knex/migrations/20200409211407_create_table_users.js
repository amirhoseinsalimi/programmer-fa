exports.up = knex =>
  knex.schema
    .hasTable('users')
    .then(exists => {
      if (!exists) {
        return knex.schema.createTable('users', table => {
          table.increments().primary();
          table.string('user_id').notNullable();
          table.string('name').notNullable();
          table.string('screen_name').notNullable();
          table.timestamps(true, true);
        });
      }
    })
    .catch(() => {});

exports.down = knex =>
  knex.schema
    .hasTable('users')
    .then(exists => {
      if (exists) {
        return knex.schema.dropTableIfExists('users');
      }
    })
    .catch(() => {});

exports.config = { transaction: false };
