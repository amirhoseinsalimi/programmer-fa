import { readdir, readFile, writeFile } from 'fs';
import { promisify } from 'util';
import * as path from 'path';

path.resolve('./');

async function asyncForEach<T>(array: T[], callback: Function): Promise<void> {
  for (let index = 0; index < array.length; index += 1) {
    // eslint-disable-next-line
    await callback(array[index], index, array);
  }
}

const readdirPromisified = promisify(readdir);
const readFilePromisified = promisify(readFile);
const writeFilePromisified = promisify(writeFile);

(async (): Promise<void> => {
  const WORDS_PATH = './src/data/';

  try {
    const files = await readdirPromisified(WORDS_PATH);

    await asyncForEach(files, async (file: string) => {
      const currentFile = `${WORDS_PATH}/${file}`;

      const data = await readFilePromisified(currentFile);

      const dataArray = JSON.parse(data.toString());

      const dataArrayUnique = [...new Set(dataArray)];

      dataArrayUnique.sort();

      await writeFilePromisified(currentFile, JSON.stringify(dataArrayUnique, null, 2));
    });
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();
