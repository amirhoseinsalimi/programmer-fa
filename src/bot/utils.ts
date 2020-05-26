import { T } from './twit';

const {
  NODE_ENV: env,
  DEBUG_MODE: debugMode,
  DB_ENABLE: enableDB,
} = require('../../env.js');

const suspiciousWords: string[] = require('../data/suspicious-words.json');
const blackListedAccounts: string[] = require('../data/black-listed-accounts.json');

const knex = require('../../knex-export.js');

interface Message {
  message: string;
  err?: any;
}

/**
 * Get an array of all occurrences of a substring in a string
 * @param {string} subStr - The sub-string to look for its occurrences
 * @param {string} str - The full string to search in
 * @param {boolean} [caseSensitive = false] - Case sensitivity matters?
 * @return {string[]}
 */
export const getAllOccurrences = (
  subStr: string,
  str: string,
  caseSensitive: boolean = false
): number[] => {
  const subStrLen: number = subStr.length;

  if (subStrLen === 0) {
    return [];
  }

  let startIndex: number = 0,
    index: number = 0,
    indices: number[] = [];

  if (!caseSensitive) {
    str = str.toLowerCase();
    subStr = subStr.toLowerCase();
  }

  while ((index = str.indexOf(subStr, startIndex)) > -1) {
    indices.push(index);
    startIndex = index + subStrLen;
  }

  return indices;
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

/**
 * Remove URLs from the tweet.
 * This function finds and removes URLs from the text of the tweet
 * and pass the rest to the main program. Sounds weired but w/o this
 * function, URLs that contain `html`, `php`, etc. match the keywords!
 * @param {string} text - The text of the tweet
 * @return {string}
 */
export const removeURLs = (text: string): string => {
  const urlRegex: RegExp = /(https?:\/\/[^\s]+)/g;

  let lText: string = text.toLowerCase();
  lText.replace(urlRegex, '');

  return lText;
};

/**
 * Checks whether a tweet has URL entities or not
 * @param tweet
 * @return boolean
 */
export const hasURLs = (tweet: any): boolean => tweet.entities.urls.length > 0;

/**
 * Whether a tweet is under 140 characters long or not
 * @param {*} tweet - The tweet object
 * @return {boolean}
 */
export const isTweetExtended = (tweet: any): boolean =>
  tweet.truncated === true;

/**
 * Whether a tweet is in Farsi or not.
 * This behaviour relies on Twitter API.
 * @param {*} tweet - The tweet object
 * @return boolean
 */
export const isTweetFarsi = (tweet: any): boolean => tweet.lang === 'fa';

/**
 *
 * @param {*} tweet - The tweet object
 * @return {boolean}
 */
export const isTweetNotAReply = (tweet: any): boolean =>
  // Polyfill to check whether a tweet is a reply or not
  !tweet.in_reply_to_status_id && !tweet.in_reply_to_user_id;

/**
 *
 * @param {*} tweet - The tweet object
 * @return {string}
 */
export const getTweetFullText = (tweet: any): string =>
  // All tweets have a `text` property, but the ones having 140 or more
  // characters have `extended_tweet` property set to `true` and an extra
  // `extended_tweet` property containing the actual tweet's text under
  // `full_text`. For tweets which are not truncated the former `text` is
  // enough.
  isTweetExtended(tweet) ? tweet.extended_tweet.full_text : tweet.text;

/**
 *
 * @param {*} tweet - The tweet object
 * @return {string[]}
 */
export const getTweetHashtags = (tweet: any): string[] =>
  tweet.entities.hashtags;

/**
 * Whether the environment is in debug mode or not
 * @return {boolean}
 */
export const isDebugModeEnabled = (): boolean => {
  const environment = env || 'development';

  if (environment === 'production') {
    return false;
  } else {
    return debugMode !== 'false';
  }
};

/**
 * Retweet the passed tweet by the given `id`
 * @param {number} id - Tweet ID
 * @return {Promise}
 */
export const retweet = (id: number): Promise<Message> =>
  new Promise((resolve, reject) => {
    T.post('statuses/retweet/:id', { id: id.toString() }, (err) => {
      if (err) {
        reject({
          message: `Failed to retweet the tweet ${id}`,
          err: err,
        });
      }

      resolve({ message: 'Tweet retweeted successfully' });
    });
  });

/**
 * Favourite/Like the passed tweet by the given `id`
 * @param {number} id - Tweet ID
 * @return {Promise}
 */
export const favourite = (id: number): Promise<Message> =>
  new Promise((resolve, reject) => {
    T.post('/favorites/create', { id: id.toString() }, (err) => {
      if (err) {
        reject({
          message: `Failed to favorite the tweet ${id}`,
          err: err,
        });
      }

      resolve({ message: 'Tweet favourited successfully' });
    });
  });

/**
 * Store the given tweet in the database
 * @param {*} tweet - The tweet object
 * @return {Promise}
 */
export const store = (tweet: any): Promise<Message> => {
  return new Promise((resolve, reject) => {
    if (enableDB === 'false') {
      resolve({ message: 'Database storage is disabled' });
    }

    const {
      in_reply_to_status_id,
      in_reply_to_user_id,
      source,
      user,
      id_str,
      $tweetText,
    } = tweet;

    knex('tweets')
      .insert({
        tweet_id: id_str,
        text: $tweetText,
        source,
        is_retweet: false, // for now
        in_reply_to_status_id,
        in_reply_to_user_id,
        user_id: user.id_str,
      })
      .then(() => {
        resolve({ message: 'Tweet stored in the database' });
      })
      .catch((err: Error) => {
        reject({
          message: 'Failed to store the tweet in the database',
          err: err,
        });
      });
  });
};

/**
 * Check if the user is not in the blacklist
 * @param {string} userId
 * @return {boolean}
 */
export const isNotBlackListed = (userId: string): boolean =>
  !blackListedAccounts.includes(userId);

/**
 * Returns the number of intersections b/w two arrays
 * @param {string[]} arr1
 * @param {string[]} arr2
 * @return {number}
 */
export const getIntersectionCount = (arr1: string[], arr2: string[]): number =>
  [...new Set(arr1)].filter((v) => arr2.includes(v)).length;

/**
 * Check if a tweet has 4 hashtags or less. See it as an ad-blocker.
 * @param {*} tweet - The tweet object
 * @return {boolean}
 */
export const hasLessThanFourHashtags = (tweet: any): boolean =>
  getAllOccurrences('#', getTweetFullText(tweet), true).length <= 4 &&
  tweet.entities.hashtags.length <= 4;

/**
 * Check if a tweet is retweeted by ME or not
 * @param {*} tweet - The tweet object
 * @return {boolean}
 */
export const isRetweeted = (tweet: any): boolean => tweet.retweeted;
