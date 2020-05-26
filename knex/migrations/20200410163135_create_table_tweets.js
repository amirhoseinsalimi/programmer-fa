exports.up = (knex) => knex.schema
  .hasTable('tweets')
  .then((exists) => {
    if (!exists) {
      knex.schema.createTable('tweets', (table) => {
        table.increments().primary();
        table.string('tweet_id', 50).notNullable().unique();
        table.text('text').notNullable();
        table.string('source').nullable();
        table.boolean('is_retweet').defaultTo(false);
        table.boolean('in_reply_to_status_id').nullable();
        table.boolean('in_reply_to_user_id').nullable();

        table.string('user_id');
        table.timestamps(true, true);
      });
    }
  })
  .catch((err) => {
    console.error(err);
  });

exports.down = (knex) => knex.schema
  .hasTable('tweets')
  .then((exists) => {
    if (exists) {
      knex.schema.dropTableIfExists('tweets');
    }
  })
  .catch((err) => {
    console.error(err);
  });

exports.config = { transaction: false };
