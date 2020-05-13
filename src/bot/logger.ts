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
    const formattedText = `\n=======================================\n${text}\n=======================================`;

    fs.appendFile(
      'logs/retweets.log',
      formattedText,
      typeof text === 'string' ? 'utf8' : '',
      (err: ErrnoException | null) => {
        if (err) logError(err);
      }
    );
  }

  return;
}
