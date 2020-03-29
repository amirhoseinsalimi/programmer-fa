import { T, connection } from './app';
import { MysqlError } from 'mysql';
import { logError, logSuccess } from './logger';

/**
 * Get an array of all occurrences of a substring in a string
 * @param {string} subStr - The sub-string to look for its occurrences
 * @param {string} str - The full string to search in
 * @param {boolean} [caseSensitive = false] - Case sensitivity matters?
 * @return {string[]}
 */
export function getAllOccurrences(
  subStr: string,
  str: string,
  caseSensitive: boolean = false
): number[] {
  const subStrLen = subStr.length;

  if (subStrLen === 0) {
    return [];
  }

  let startIndex = 0,
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
}

/**
 * Whether a tweet is under 140 characters long or not
 * @param {*} tweet - The tweet object
 * @return {boolean}
 */
export function isTweetExtended(tweet: any): boolean {
  return tweet.truncated === true;
}

/**
 * Whether a tweet is in Farsi or not.
 * This behaviour relies on Twitter API.
 * @param {*} tweet - The tweet object
 * @return boolean
 */
export function isTweetFarsi(tweet: any): boolean {
  return tweet.lang === 'fa';
}

/**
 *
 * @param {*} tweet - The tweet object
 * @return {boolean}
 */
export function isTweetNotAReply(tweet: any): boolean {
  // Polyfill to check whether a tweet is a reply or not
  return !tweet.in_reply_to_status_id && !tweet.in_reply_to_user_id;
}

/**
 *
 * @param {*} tweet - The tweet object
 * @return {string}
 */
export function getTweetFullText(tweet: any): string {
  // All tweets have a `text` property, but the ones having 140 or more
  // characters have `extended_tweet` property set to `true` and an extra
  // `extended_tweet` property containing the actual tweet's text under
  // `full_text`. For tweets which are not truncated the former `text` is
  // enough.
  return isTweetExtended(tweet) ? tweet.extended_tweet.full_text : tweet.text;
}

/**
 *
 * @param {*} tweet - The tweet object
 * @return {string[]}
 */
export function getTweetHashtags(tweet: any): string[] {
  return tweet.entities.hashtags;
}

/**
 *
 * @return {string}
 */
export function getCurrentEnv(): string {
  let currentEnv: string;

  if (process.env.NODE_ENV === 'production') {
    currentEnv = process.env.NODE_ENV;
  } else if (process.env.NODE_ENV === 'staging') {
    currentEnv = process.env.NODE_ENV;
  } else {
    currentEnv = 'development';
  }

  return currentEnv;
}

/**
 * Whether the environment is restricted to do some actions or not
 * @return {boolean}
 */
export function isEnvRestricted(): boolean {
  if (getCurrentEnv() === 'production') {
    return false;
  } else {
    return !!process.env.RESTRICTED_ENV;
  }
}

/**
 * Retweet the passed tweet by the given `id`
 * @param {number} id
 * @return {Promise}
 */
export function retweet(id: number): Promise<any> {
  return new Promise((resolve, reject) => {
    T.post(
      'statuses/retweet/:id',
      { id: id.toString() },
      (err, result, response) => {
        if (err) {
          return reject(err);
        }

        resolve({ message: 'Tweet retweeted successfully' });
      }
    );
  });
}

/**
 * Favourite/Like the passed tweet by the given `id`
 * @param {number} id
 * @return {Promise}
 */
export function favourite(id: number): Promise<any> {
  return new Promise((resolve, reject) => {
    T.post(
      '/favorites/create',
      { id: id.toString() },
      (err, result, response) => {
        if (err) {
          return reject(err);
        }

        resolve({ message: 'Tweet favourited successfully' });
      }
    );
  });
}

/**
 * Store the given tweet in the database
 * @param {*} tweet
 * @return {Promise}
 */
export function store(tweet: any) {
  const query =
    'INSERT INTO `tweets` (tweet_id, tweet_text, user_name, user_id, created_at) VALUES (?, ?, ?, ?, ?)';

  const tweeText = getTweetFullText(tweet);

  return new Promise((resolve, reject) => {
    connection.query(
      query,
      [
        tweet.id_str,
        tweeText,
        tweet.user.screen_name,
        tweet.user.id,
        tweet.created_at,
      ],
      (err: MysqlError) => {
        if (err) {
          reject(err);
        } else {
          resolve({ message: 'Tweet stored in the database' });
        }
      }
    );
  });
}
