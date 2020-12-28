import * as Knex from 'knex';
import { CreateTableBuilder } from 'knex';

const TABLE_NAME = 'tweets';

export async function up({ schema }: Knex): Promise<any> {
  try {
    const tableExists = await schema.hasTable(TABLE_NAME);

    if (!tableExists) {
      return await schema.createTable(TABLE_NAME, (table: CreateTableBuilder) => {
        table.collate('utf8mb4_unicode_ci');

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