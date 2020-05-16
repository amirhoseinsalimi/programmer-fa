import ErrnoException = NodeJS.ErrnoException;

const colorIt = require('color-it');
const fs = require('fs');
import { isDebugModeEnabled } from './utils';

export function logWarning(...args: string[]): void {
  if (isDebugModeEnabled()) {
    const l = args.length;

    for (let i = 0; i < l; i++) {
      console.log('' + colorIt(args[i]).orange());
    }
  }

  return;
}

export function logError(...args: any): void {
  if (isDebugModeEnabled()) {
    const l = args.length;

    for (let i = 0; i < l; i++) {
      console.error('' + colorIt(args[i]).red());
    }
  }

  return;
}

export function logInfo(...args: any): void {
  if (isDebugModeEnabled()) {
    const l = args.length;

    for (let i = 0; i < l; i++) {
      console.log('' + colorIt(args[i]).belizeHole());
    }
  }

  return;
}

export function logSuccess(...args: any): void {
  if (isDebugModeEnabled()) {
    const l = args.length;

    for (let i = 0; i < l; i++) {
      console.log('' + colorIt(args[i]).green());
    }
  }

  return;
}

export function writeToFile(text: string | Buffer): void {
  if (isDebugModeEnabled()) {
    const formattedText = `
    \n=======================================
    \n${text}
    \n=======================================
    `;

    const d = new Date();
    const fileName = `${d.getFullYear()}-${d.getMonth() +
      1}-${d.getDate()} - H${d.getHours()}.log`;

    fs.appendFile(
      `logs/${fileName}`,
      formattedText,
      typeof text === 'string' ? 'utf8' : '',
      (err: ErrnoException | null) => {
        if (err) logError(err);
      }
    );
  }

  return;
}

export function printWelcomeBanner() {
  fs.readFile(
    `${process.cwd()}/.banner`,
    'utf8',
    (err: ErrnoException | null, banner: string) => {
      if (err) {
        logError(err);
        return;
      }

      console.log(banner);

      logSuccess('Bot has been started...');

      if (isDebugModeEnabled()) {
        logInfo(
          'The bot has been started in development environment, so it does not' +
            ' emit retweets, instead stores them in the database and logs the text of' +
            ' the tweets in a file. To change this behavior set `NODE_ENV=production`' +
            ' in the .env file'
        );
      }
    }
  );
}
