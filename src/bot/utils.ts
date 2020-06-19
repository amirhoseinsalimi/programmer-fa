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
 * @param {string} str - The full string to search in
 * @return {string[]}
 */
export const getCountOfHashtags = (str: string): number => {
  if (str.length === 0) {
    return 0;
  }

  return str.match(/#.*?/mgi).length;
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
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const lText: string = text.toLowerCase();
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
export const isTweetExtended = (tweet: any): boolean => (
  tweet.truncated === true
);

/**
 * Whether a tweet is in Farsi or not.
 * This behaviour relies on Twitter API.
 * @param {*} tweet - The tweet object
 * @return boolean
 */
export const isTweetFarsi = (tweet: any): boolean => tweet.lang === 'fa';

/**
 * Whether a tweet is a reply or not.
 * @param {*} tweet - The tweet object
 * @return {boolean}
 */
export const isTweetAReply = (tweet: any): boolean => (
  // Polyfill to check whether a tweet is a reply or not
  tweet.in_reply_to_status_id || tweet.in_reply_to_user_id
);

/**
 * Return the full text of the tweet
 * @param {*} tweet - The tweet object
 * @return {string}
 */
export const getTweetFullText = (tweet: any): string => (
  // All tweets have a `text` property, but the ones having 140 or more
  // characters have `extended_tweet` property set to `true` and an extra
  // `extended_tweet` property containing the actual tweet's text under
  // `full_text`. For tweets which are not truncated the former `text` is
  // enough.
  isTweetExtended(tweet) ? tweet.extended_tweet.full_text : tweet.text
);

/**
 *
 * @param {*} tweet - The tweet object
 * @return {string[]}
 */
export const getTweetHashtags = (tweet: any): string[] => (
  tweet.entities.hashtags
);

/**
 * Whether the environment is in debug mode or not
 * @return {boolean}
 */
export const isDebugModeEnabled = (): boolean => {
  const environment = env || 'development';

  if (environment === 'production') {
    return false;
  }
  return debugMode !== 'false';
};

/**
 * Retweet the passed tweet by the given `id`
 * @param {number} id - Tweet ID
 * @return {Promise}
 */
export const retweet = (id: number): Promise<Message> => (
  new Promise((resolve, reject) => {
    T.post('statuses/retweet/:id', { id: id.toString() }, (err: any) => {
      if (err) {
        reject(new Error(`Failed to retweet the tweet ${id}`));
      }

      resolve({ message: 'Tweet retweeted successfully' });
    });
  })
);

/**
 * Favourite/Like the passed tweet by the given `id`
 * @param {number} id - Tweet ID
 * @return {Promise}
 */
export const favourite = (id: number): Promise<Message> => (
  new Promise((resolve, reject) => {
    T.post('/favorites/create', { id: id.toString() }, (err: any) => {
      if (err) {
        reject(new Error(`Failed to favorite the tweet ${id}`));
      }

      resolve({ message: 'Tweet favourited successfully' });
    });
  })
);

/**
 * Store the given tweet in the database
 * @param {*} tweet - The tweet object
 * @return {Promise}
 */
export const store = (tweet: any): Promise<Message> => (
  new Promise((resolve, reject) => {
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

    const {
      id_str: userIdStr,
      screen_name,
      name,
    } = user;

    knex('users')
      .insert({
        id_str: userIdStr,
        screen_name,
        name,
      });

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
      .catch(() => {
        reject(new Error('Failed to store the tweet in the database'));
      });
  })
);

/**
 * Check if the user is in the blacklist
 * @param {*} tweet
 * @return {boolean}
 */
export const isBlackListed = (tweet: any): boolean => {
  const originalUserId: string = tweet.retweet_status?.user?.id_str;
  const retweetedUserId: string = tweet.user.id_str;

  return blackListedAccounts.includes(retweetedUserId)
    || blackListedAccounts.includes(originalUserId);
};

/**
 * Returns the number of intersections b/w two arrays
 * @param {string[]} arr1
 * @param {string[]} arr2
 * @return {number}
 */
export const getIntersectionCount = (arr1: string[], arr2: string[]): number => (
  [...new Set(arr1)].filter((v) => arr2.includes(v)).length
);

/**
 * Check if a tweet has 5 hashtags or more. See it as an ad-blocker.
 * @param {*} tweet - The tweet object
 * @return {boolean}
 */
export const hasFiveHashtagsOrMore = (tweet: any): boolean => (
  getCountOfHashtags(tweet.$tweetText) >= 5
  || tweet.entities.hashtags.length >= 5
);

/**
 * Check if a tweet is retweeted by ME or not
 * @param {*} tweet - The tweet object
 * @return {boolean}
 */
export const isRetweeted = (tweet: any): boolean => tweet.retweeted;

/**
 * Validate the tweet properties for further process:
 *   1. Checks the language of the tweet
 *   2. Checks whether the tweet is a reply or not
 *   3. Checks whether the tweet has for or less hashtags "#"
 *   4. See if the user is blocked or not
 * @param {*} tweet - The tweet object
 * @return {boolean} - Whether the tweet is validated or not
 */
export const validateInitialTweet = (tweet: any): boolean => {
  if (!isTweetFarsi(tweet)) {
    return false;
  }

  if (isTweetAReply(tweet)) {
    return false;
  }

  if (hasFiveHashtagsOrMore(tweet)) {
    return false;
  }

  if (isBlackListed(tweet)) {
    return false;
  }

  return true;
};

export const removeRetweetNotation = (tweetText: string): string => (
  tweetText.replace(/(RT @.*?:)/m, '').trim()
);
