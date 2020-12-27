const TABLE_NAME = 'users';

exports.up = async ({ schema }) => {
  try {
    const tableExists = await schema.hasTable(TABLE_NAME);

    if (!tableExists) {
      return schema.createTable(TABLE_NAME, (table) => {
        table.collate('utf8mb4_unicode_ci');

        table.increments().primary();
        table.string('user_id').notNullable();
        table.string('name').notNullable();
        table.string('screen_name').notNullable();
        table.timestamps(true, true);
      });
    }
  } catch (e) {
    throw e;
  }
}

exports.down = async ({ schema }) => {
  try {
    const tableExists = await schema.hasTable(TABLE_NAME);

    if (tableExists) {
      return await schema.dropTableIfExists(TABLE_NAME);
    }
  } catch (e) {
    throw e;
  }
}

exports.config = { transaction: false };
