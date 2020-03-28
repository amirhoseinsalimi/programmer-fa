const colorIt = require('color-it');

export function logWarning(...args: any): void {
  const l = args.length;

  for (let i = 0; i < l; i++) {
    console.log('' + args[i].orange());
  }
}

export function logError(...args: any): void {
  const l = args.length;

  for (let i = 0; i < l; i++) {
    console.log('' + args[i].red());
  }
}

export function logInfo(...args: any): void {
  const l = args.length;

  for (let i = 0; i < l; i++) {
    console.log('' + args[i].belizeHole());
  }
}

export function logSuccess(...args: any): void {
  const l = args.length;

  for (let i = 0; i < l; i++) {
    console.log('' + args[i].green());
  }
}
