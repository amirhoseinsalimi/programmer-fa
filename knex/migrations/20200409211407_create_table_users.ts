import * as Knex from 'knex';
import { CreateTableBuilder } from 'knex';

const TABLE_NAME = 'users';

export async function up({ schema }: Knex): Promise<any> {
  try {
    const tableExists = await schema.hasTable(TABLE_NAME);

    if (!tableExists) {
      return schema.createTable(TABLE_NAME, (table: CreateTableBuilder) => {
        table.collate('utf8mb4_unicode_ci');

        table.increments().primary();
        table.string('user_id').notNullable().unique();
        table.string('name').notNullable();
        table.string('screen_name').notNullable();
        table.timestamps(true, true);
      });
    }
  } catch (e) {
    throw e;
  }
}

export async function down({ schema }: Knex): Promise<any> {
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
