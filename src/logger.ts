const colorIt = require('color-it');

export function logWarning(message: string): void {
  console.log('' + colorIt(message).orange());
}

export function logError(message: string): void {
  console.log('' + colorIt(message).red());
}

export function logInfo(message: string): void {
  console.log('' + colorIt(message).belizeHole());
}

export function logSuccess(message: string): void {
  console.log('' + colorIt(message).green());
}
