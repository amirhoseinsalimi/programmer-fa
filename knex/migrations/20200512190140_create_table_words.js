const TABLE_NAME = 'words';

exports.up = async ({ schema }) => {
  try {
    const tableExists = await schema.hasTable(TABLE_NAME);

    if (!tableExists) {
      return await schema.createTable(TABLE_NAME, (table) => {
        table.increments().primary();
        table.integer('word').notNullable().unique();

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
