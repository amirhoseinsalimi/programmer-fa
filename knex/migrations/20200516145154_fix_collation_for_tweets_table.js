exports.up = (knex) => knex.schema
  .hasTable('tweets')
  .then((exists) => {
    if (exists) {
      knex.schema.alterTable('tweets', (table) => {
        table.collate('utf8mb4_unicode_ci');
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
      knex.schema.alterTable('tweets', (table) => {
        table.collate('utf8_unicode_ci');
      });
    }
  })
  .catch((err) => {
    console.error(err);
  });

exports.config = { transaction: false };
