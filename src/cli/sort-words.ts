import { readdir, readFile, writeFile } from 'fs';
import { promisify } from 'util';
import * as path from 'path';

path.resolve('./');

async function asyncForEach<T>(
  array: T[],
  callback: (value: T, index: number, arrayItself: T[]) => void,
): Promise<void> {
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

      const currentFileContent = await readFilePromisified(currentFile);

      const currentFileContentArray: string[] = JSON.parse(currentFileContent.toString());

      const currentFileContentUnique = [...new Set(currentFileContentArray)];

      const currentFileContentLowerCase = currentFileContentUnique.map(
        (v: string) => v.toLowerCase(),
      );

      currentFileContentLowerCase.sort();

      await writeFilePromisified(currentFile, JSON.stringify(currentFileContentLowerCase, null, 2));
    });
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();
