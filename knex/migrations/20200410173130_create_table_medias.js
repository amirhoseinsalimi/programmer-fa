exports.up = (knex) => knex.schema
  .hasTable('medias')
  .then((exists) => {
    if (!exists) {
      knex.schema.createTable('medias', (table) => {
        table.increments().primary();
        table.string('media_url').notNullable();

        table.integer('tweet_id').notNullable();
        table.timestamps(true, true);
      });
    }
  })
  .catch((err) => {
    console.error(err);
  });

exports.down = (knex) => knex.schema
  .hasTable('medias')
  .then((exists) => {
    if (exists) {
      knex.schema.dropTableIfExists('medias');
    }
  })
  .catch((err) => {
    console.error(err);
  });

exports.config = { transaction: false };
