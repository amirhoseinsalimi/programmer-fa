exports.up = knex =>
  knex.schema
    .hasTable('tweets')
    .then(exists => {
      if (!exists) {
        return knex.schema.alterTable('tweets', table => {
          table.collate('utf8mb4_unicode_ci');
        });
      }
    })
    .catch(() => {});

exports.down = knex =>
  knex.schema
    .hasTable('tweets')
    .then(exists => {
      if (exists) {
        return knex.schema.alterTable('tweets', table => {
          table.collate('utf8_unicode_ci');
        });
      }
    })
    .catch(() => {});

exports.config = { transaction: false };
