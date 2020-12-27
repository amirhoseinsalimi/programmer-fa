const TABLE_NAME = 'medias';

exports.up = async ({ schema }) => {
  try {
    const tableExists = await schema.hasTable(TABLE_NAME);

    if (!tableExists) {
      return await schema.createTable(TABLE_NAME, (table) => {
        table.increments().primary();
        table.string('media_url').notNullable();

        table.integer('tweet_id').notNullable();
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
