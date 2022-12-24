/* eslint-disable consistent-return */

import * as Knex from 'knex';
import { CreateTableBuilder } from 'knex';

const TABLE_NAME = 'words';

export async function up({ schema }: Knex): Promise<any> {
  const tableExists = await schema.hasTable(TABLE_NAME);

  if (tableExists) {
    return;
  }

  return schema.createTable(TABLE_NAME, (table: CreateTableBuilder) => {
    table.increments().primary();
    table.integer('word').notNullable().unique();

    table.timestamps(true, true);
  });
}

export async function down({ schema }: Knex): Promise<any> {
  const tableExists = await schema.hasTable(TABLE_NAME);

  if (!tableExists) {
    return;
  }

  return schema.dropTableIfExists(TABLE_NAME);
}

exports.config = { transaction: false };
