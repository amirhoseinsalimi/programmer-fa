exports.up = knex =>
  knex.schema
    .hasTable('words')
    .then(exists => {
      if (!exists) {
        return knex.schema.createTable('words', table => {
          table.increments().primary();
          table.integer('word').notNullable().unique();

          table.timestamps(true, true);
        });
      }
    })
    .catch(() => {});

exports.down = knex =>
  knex.schema
    .hasTable('tweets')
    .then(exists => {
      if (exists) {
        return knex.schema.dropTableIfExists('tweets');
      }
    })
    .catch(() => {});

exports.config = { transaction: false };
