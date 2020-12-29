/* eslint-disable consistent-return */

import * as Knex from 'knex';
import { CreateTableBuilder } from 'knex';

const TABLE_NAME = 'tweets';

export async function up({ schema }: Knex): Promise<any> {
  const tableExists = await schema.hasTable(TABLE_NAME);

  if (!tableExists) {
    return schema.createTable(TABLE_NAME, (table: CreateTableBuilder) => {
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
}

export async function down({ schema }: Knex): Promise<any> {
  const tableExists = await schema.hasTable(TABLE_NAME);

  if (tableExists) {
    return schema.dropTableIfExists(TABLE_NAME);
  }
}

exports.config = { transaction: false };
