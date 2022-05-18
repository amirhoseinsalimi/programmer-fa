/* eslint-disable consistent-return */

import * as Knex from 'knex';
import envs from '../../env';

const TABLE_NAME = 'users';

export async function up({ schema }: Knex): Promise<any> {
  const tableExists = await schema.hasTable(TABLE_NAME);

  if (tableExists) {
    return schema.raw(
      `ALTER DATABASE \`${envs.DB_NAME}\` CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;`,
    );
  }
}

export async function down({ schema }: Knex): Promise<any> {
  const tableExists = await schema.hasTable(TABLE_NAME);

  if (tableExists) {
    return schema.raw(
      `ALTER DATABASE \`${envs.DB_NAME}\` CHARACTER SET = utf8 COLLATE = utf8_unicode_ci;`,
    );
  }
}

exports.config = { transaction: false };
