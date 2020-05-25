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
    .catch((err) => {
      console.error(err);
    });
exports.down = knex =>
  knex.schema
    .hasTable('words')
    .then(exists => {
      if (exists) {
        return knex.schema.dropTableIfExists('words');
      }
    })
    .catch((err) => {
      console.error(err);
    });

exports.config = { transaction: false };
