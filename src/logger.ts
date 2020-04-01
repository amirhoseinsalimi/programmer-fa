const colorIt = require('color-it');

export function logWarning(...args: string[]): void {
  const l = args.length;

  for (let i = 0; i < l; i++) {
    console.log('' + colorIt(args[i]).orange());
  }
}

export function logError(...args: any): void {
  const l = args.length;

  for (let i = 0; i < l; i++) {
    console.error('' + colorIt(args[i]).red());
  }
}

export function logInfo(...args: any): void {
  const l = args.length;

  for (let i = 0; i < l; i++) {
    console.log('' + colorIt(args[i]).belizeHole());
  }
}

export function logSuccess(...args: any): void {
  const l = args.length;

  for (let i = 0; i < l; i++) {
    console.log('' + colorIt(args[i]).green());
  }
}
