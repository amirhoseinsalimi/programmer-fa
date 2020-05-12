exports.up = knex =>
  knex.schema
    .hasTable('medias')
    .then(exists => {
      if (!exists) {
        return knex.schema.createTable('medias', table => {
          table.increments().primary();
          table.string('media_url').notNullable();

          table.integer('tweet_id').notNullable();
          table.timestamps(true, true);
        });
      }
    })
    .catch(() => {});

exports.down = knex =>
  knex.schema
    .hasTable('medias')
    .then(exists => {
      if (exists) {
        return knex.schema.dropTableIfExists('medias');
      }
    })
    .catch(() => {});

exports.config = { transaction: false };
