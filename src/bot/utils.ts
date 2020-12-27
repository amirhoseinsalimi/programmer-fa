import { readFileSync } from 'fs';
import { T } from './twit';

const {
  NODE_ENV: env,
  DEBUG_MODE: debugMode,
  DB_ENABLE: enableDB,
} = require('../../env.js');

const suspiciousWords: string[] = require('../data/words-with-suspicion.json');
const blackListedAccounts: string[] = require('../data/accounts-not-to-follow.json');

const knex = require('../../knex-export.js');

interface Message {
  message: string;
}

/**
 * Get the number of hashtags of a tweet
 * @param {string} str - The full string to search in
 * @return {string[]}
 */
export const getNumberOfHashtags = (str: string): number => {
  if (str.length === 0) {
    return 0;
  }

  const matches: RegExpMatchArray = str.match(/#\S/mgi);

  return (matches && matches.length) ? matches.length : 0;
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
export const hasSuspiciousURLs = (tweet: any): boolean => (
  tweet.entities.urls.length > 0 && tweet.entities.urls.some((urlEntity: string) => (
    /(\.apsx|\.php|\.html)/.test(urlEntity)
  ))
);

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
 * Whether a tweet is a retweet or not.
 * @param tweet
 * @return {boolean}
 */
export const isRetweet = (tweet: any): boolean => (
  Object.prototype.hasOwnProperty.call(tweet, 'retweeted_status')
);

/**
 * Whether a tweet is a reply or not.
 * @param {*} tweet - The tweet object
 * @return {boolean}
 */
export const isTweetAReply = (tweet: any): boolean => (
  // Polyfill to check whether a tweet is a reply or not
  tweet.in_reply_to_status_id
  || tweet.in_reply_to_user_id
  || isRetweet(tweet) ? (tweet.retweeted_status || tweet.in_reply_to_status_id) : false
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
 * @return {Promise<Message | Error>}
 */
export const retweet = async (id: string): Promise<Message | Error> => {
  let response: Message | Error;

  try {
    T.post('statuses/retweet/:id', { id }, (err: Error) => {
      if (err) {
        throw err;
      }

      response = { message: 'Tweet retweeted successfully' };
    });
  } catch (e) {
    response = e;
  }

  return response;
};

/**
 * Favourite/Like the passed tweet by the given `id`
 * @param {number} id - Tweet ID
 * @return {Promise<Message | Error>}
 */
export const favourite = async (id: string): Promise<Message | Error> => {
  let response: Message | Error;

  try {
    T.post('/favorites/create', { id }, (err: Error) => {
      if (err) {
        throw err;
      }

      response = { message: 'Tweet favourited successfully' };
    });
  } catch (e) {
    response = e;
  }

  return response;
};

/**
 * Store the given tweet in the database
 * @param {*} tweet - The tweet object
 * @return {Promise<Message | Error>}
 */
export const store = async (tweet: any): Promise<Message | Error> => {
  if (enableDB === 'false') {
    return {
      message: 'Database storage is disabled',
    };
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

  try {
    await knex('users')
      .insert({
        id_str: userIdStr,
        screen_name,
        name,
      });

    await knex('tweets')
      .insert({
        tweet_id: id_str,
        text: $tweetText,
        source,
        is_retweet: isRetweet(tweet),
        in_reply_to_status_id,
        in_reply_to_user_id,
        user_id: user.id_str,
      });

    return { message: 'Tweet stored in the database' };
  } catch (e) {
    return new Error(e);
  }
};

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
 * Check if a tweet has 5 hashtags or more. See it as an ad-blocker.
 * @param {*} tweet - The tweet object
 * @return {boolean}
 */
export const hasFiveHashtagsOrMore = (tweet: any): boolean => (
  getNumberOfHashtags(getTweetFullText(tweet)) >= 5
  || tweet.entities.hashtags.length >= 5
);

/**
 * Check if a tweet is retweeted by ME or not
 * @param {*} tweet - The tweet object
 * @return {boolean}
 */
export const isRetweetedByMyself = (tweet: any): boolean => tweet.retweeted;

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

/**
 * Remove the `@username` from the tweet body
 * @param {string} tweetText - The text of a tweet
 * @return {string} - The text of the tweet w/ `@username` removed
 */
export const removeRetweetNotation = (tweetText: string): string => (
  tweetText.replace(/(RT @.*?:)/gim, '').trim()
);

/**
 * Checks whether a file is JSON or not, using file extension for this purpose
 * @param {string} fileName - The name of the file
 * @return {boolean} - File is JSON or not
 */
export const isFileJSON = (fileName: string): boolean => (/\.(json)$/i.test(fileName));

/**
 * Load the content of a given file, JSON only
 * @param {string} filePath - The full path of the JSON file
 * @return {string[]} - The text of the tweet w/ `@username` removed
 */
export const loadJSONFileContent = (filePath: string): string[] | Error => {
  let fileContent: string;

  if (!isFileJSON(filePath)) {
    return new Error('File is not JSON');
  }

  try {
    fileContent = readFileSync(filePath, 'utf8');
  } catch (e) {
    return new Error(e);
  }

  fileContent = JSON.parse(fileContent);

  return Array.isArray(fileContent) ? fileContent : new Error('File doesn\'t include an array');
};

/**
 * Convert a string to hashtag
 * @param {string} string - The word to be hashtagged
 * @return {string} - The hashtagged form of the given string
 */
export const makeHashtag = (string: string): string => {
  let s: string;

  // Replace space, half-space, dash, dot w/ an underscore
  s = string.replace(/[ ‌\-.]/gmi, '_');

  // Replace subsequent underscores with one underscore
  s = s.replace(/_{2,}/, '_');

  // Add a number sign at the beginning of the word
  s = `#${s}`;

  return s;
};

/**
 * Fill a given array with an array of strings
 * @param {string[]} arrayToFill
 * @param {string[]} arrayOfWords
 * @return {string[]}
 */
export const fillArrayWithWords = (
  arrayToFill: string[],
  arrayOfWords: string[],
): string[] => {
  arrayOfWords.forEach((word: string) => arrayToFill.push(word));

  arrayOfWords.forEach((word: string) => {
    const w = makeHashtag(word);

    arrayToFill.push(w);
  });

  return [...new Set(arrayToFill)];
};
