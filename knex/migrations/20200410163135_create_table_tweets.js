exports.up = knex =>
  knex.schema
    .hasTable('tweets')
    .then(exists => {
      if (!exists) {
        return knex.schema.createTable('tweets', table => {
          table.increments().primary();
          table.integer('tweet_id').notNullable().unique();
          table.text('text').notNullable();
          table.string('source').notNullable();
          table.boolean('is_retweet').defaultTo(false);
          table.boolean('in_reply_to_status_id').nullable();
          table.boolean('in_reply_to_user_id').nullable();

          table.string('user_id');
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
