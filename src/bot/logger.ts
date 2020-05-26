import * as fs from 'fs';
import { isDebugModeEnabled } from './utils';

const colorIt = require('color-it');

export const logWarning = (...args: string[]): void => {
  if (isDebugModeEnabled()) {
    const l: number = args.length;

    for (let i = 0; i < l; i += 1) {
      console.log(`${colorIt(args[i]).orange()}`);
    }
  }
};

export const logError = (...args: any): void => {
  if (isDebugModeEnabled()) {
    const l: number = args.length;

    for (let i = 0; i < l; i += 1) {
      console.error(`${colorIt(args[i]).red()}`);
    }
  }
};

export const logInfo = (...args: any): void => {
  if (isDebugModeEnabled()) {
    const l: number = args.length;

    for (let i = 0; i < l; i += 1) {
      console.log(`${colorIt(args[i]).belizeHole()}`);
    }
  }
};

export const logSuccess = (...args: any): void => {
  if (isDebugModeEnabled()) {
    const l: number = args.length;

    for (let i = 0; i < l; i += 1) {
      console.log(`${colorIt(args[i]).green()}`);
    }
  }
};

export const writeToFile = (text: string | Buffer): void => {
  if (isDebugModeEnabled()) {
    const formattedText = `
    \n=======================================
    \n${text}
    \n=======================================
    `;

    const d: Date = new Date();
    const fileName = `${d.getFullYear()}-${d.getMonth()
      + 1}-${d.getDate()} - H${d.getHours()}.log`;

    fs.appendFile(
      `logs/${fileName}`,
      formattedText,
      typeof text === 'string' ? 'utf8' : '',
      (err) => {
        if (err) logError(err);
      },
    );
  }
};

export const printWelcomeBanner = (): void => {
  fs.readFile(
    `${process.cwd()}/.banner`,
    'utf8',
    (err, banner: string) => {
      if (err) {
        logError(err);
        return;
      }

      console.log(banner);

      logSuccess('Bot has been started...');

      if (isDebugModeEnabled()) {
        logInfo(
          'The bot has been started in development environment, so it does not'
            + ' emit retweets, instead stores them in the database and logs the text of'
            + ' the tweets in a file. To change this behavior set `NODE_ENV=production`'
            + ' in the .env file',
        );
      }
    },
  );
};
