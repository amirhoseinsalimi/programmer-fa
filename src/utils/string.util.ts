import { isTweetExtended } from './tweet.util';

const suspiciousWords: string[] = require('../data/words-with-suspicion.json');

/**
 * Convert a string to hashtag
 * @param {string} string - The word to be hashtagged
 * @return {string} - The hashtagged form of the given string
 */
export const makeHashtag = (string: string): string => {
  let s: string;

  // Replace space, half-space, dash, dot w/ an underscore
  s = string.replace(/[ ‌\-.]/gim, '_');

  // Replace subsequent underscores with one underscore
  s = s.replace(/_{2,}/, '_');

  // Add a number sign at the beginning of the word
  s = `#${s}`;

  return s;
};

/**
 * Returns the length of a given tweet text
 * @param {string} tweetText - The text of the tweet
 * @return {number}
 */
export const getTweetLength = (tweetText: string): number => tweetText.length;

/**
 * Return the full text of the tweet
 * @param {*} tweet - The tweet object
 * @return {string}
 */
export const getTweetFullText = (tweet: any): string =>
  // All tweets have a `text` property, but the ones having 140 or more
  // characters have `extended_tweet` property set to `true` and an extra
  // `extended_tweet` property containing the actual tweet's text under
  // `full_text`. For tweets which are not truncated the former `text` is
  // enough.
  (isTweetExtended(tweet) ? tweet.extended_tweet.full_text : tweet.text);

/**
 * Remove URLs from the tweet.
 * This function finds and removes URLs from the text of the tweet
 * and pass the rest to the main program. Sounds weired but w/o this
 * function, URLs that contain `html`, `php`, etc. match the keywords!
 * @param {string} text - The text of the tweet
 * @return {string}
 */
export const removeURLs = (text: string): string => {
  const urlRegex = /((http(s?)?):\/\/)?([wW]{3}\.)?[a-zA-Z0-9\-.]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?/gim;
  let numberOfURLs = (text.match(urlRegex) || []).length;

  let lText: string = text.toLowerCase();

  while (numberOfURLs) {
    lText = lText.replace(urlRegex, '');
    numberOfURLs -= 1;
  }

  // remove multiple contiguous spaces and return the string
  return lText.replace(/ +/g, ' ').trim();
};

/**
 * Check whether a tweet includes URLs or not
 * @param {*} tweet - The text of the tweet
 * @return {boolean}
 */
export const hasURL = (tweet: any): boolean => {
  const urlRegex = /((http(s?)?):\/\/)?([wW]{3}\.)?[a-zA-Z0-9\-.]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?/gim;

  return urlRegex.test(tweet.$tweetText) || tweet.entities?.urls?.length > 0;
};

/**
 * Get the number of hashtags of a tweet
 * @param {string} str - The full string to search in
 * @return {string[]}
 */
export const getNumberOfHashtags = (str: string): number => {
  if (str.length === 0) {
    return 0;
  }

  const matches: RegExpMatchArray = str.match(/#\S/gim);

  return matches && matches.length ? matches.length : 0;
};

/**
 * Remove the `@username` from the tweet body
 * @param {string} tweetText - The text of a tweet
 * @return {string} - The text of the tweet w/ `@username` removed
 */
export const removeRetweetNotation = (tweetText: string): string =>
  tweetText.replace(/(RT @.*?:)/gim, '').trim();

/**
 * Check if a tweet has 5 hashtags or more. See it as an ad-blocker.
 * @param {*} tweet - The tweet object
 * @return {boolean}
 */
export const hasFiveHashtagsOrMore = (tweet: any): boolean =>
  getNumberOfHashtags(getTweetFullText(tweet)) >= 5 ||
  tweet.entities.hashtags.length >= 5;

/**
 * Checks whether a tweet has URL entities or not
 * @param tweet
 * @return boolean
 */
export const hasSuspiciousURLs = (tweet: any): boolean => {
  const fileExtensionRegExp = /(\.apsx|\.php|\.html)/;

  return (
    fileExtensionRegExp.test(tweet.$tweetText) ||
    fileExtensionRegExp.test(tweet.$retweetText) ||
    tweet.entities?.urls?.some((urlEntity: string) =>
      fileExtensionRegExp.test(urlEntity),
    )
  );
};

/**
 * Remove words that are likely used in contexts other than programming.
 * This function finds and removes these words from the text of the tweet
 * and pass the rest to the main program.
 * @param {string} text - The text of the tweet
 * @return {string}
 */
export const removeSuspiciousWords = (text: string): string => {
  let lText: string = text.toLowerCase();

  suspiciousWords.forEach((word: string) => {
    const lWord: string = word.toLowerCase();

    if (text.search(new RegExp(lWord)) > -1) {
      lText = lText.replace(new RegExp(lWord, 'g'), '');
    }
  });

  // remove multiple contiguous spaces and return the string
  return lText.replace(/ +/g, ' ');
};
