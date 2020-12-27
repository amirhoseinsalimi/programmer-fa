const TABLE_NAME = 'users';

exports.up = async ({ schema }) => {
  try {
    const tableExists = await schema.hasTable(TABLE_NAME);

    if (tableExists) {
      return await schema.alterTable(TABLE_NAME, (table) => {
        table.unique(['user_id']);
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
      return await schema.alterTable('users', (table) => {
        table.dropUnique(['user_id']);
      });
    }
  } catch (e) {
    throw e;
  }
}

exports.config = { transaction: false };
