const colorIt = require('color-it');
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
