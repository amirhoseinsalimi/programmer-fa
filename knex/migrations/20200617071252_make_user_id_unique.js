exports.up = (knex) => knex.schema
  .hasTable('users')
  .then((exists) => {
    if (exists) {
      knex.schema.alterTable('users', (table) => {
          table.unique('user_id');
      });
    }
  })
  .catch((err) => {
    console.error(err);
  });
exports.down = (knex) => knex.schema
  .hasTable('users')
  .then((exists) => {
    if (exists) {
      knex.schema.alterTable('users', (table) => {
        table.dropUnique('user_id');
      });
    }
  })
  .catch((err) => {
    console.error(err);
  });

exports.config = { transaction: false };
