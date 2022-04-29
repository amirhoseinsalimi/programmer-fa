import { readFileSync } from 'fs';
import envs from '../env';
import knex from '../knex-export';
import { T } from '../twit';
import { makeHashtag } from './string.util';
import { isRetweet } from './tweet.util';
import { Message } from '../types/general';

const blackListedAccounts: string[] = require('../data/accounts-not-to-follow.json');
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

/**
 * Checks whether a file is JSON or not, using file extension for this purpose
 * @param {string} fileName - The name of the file
 * @return {boolean} - File is JSON or not
 */
export const isFileJSON = (fileName: string): boolean =>
  /\.(json)$/i.test(fileName);

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

  return Array.isArray(fileContent)
    ? fileContent
    : new Error("File doesn't include an array");
};

/**
 * Check if the user is in the blacklist
 * @param {*} tweet
 * @return {boolean}
 */
export const isBlackListed = (tweet: any): boolean => {
  const originalUserId: string = tweet.user.id_str;
  const retweeterUserId: string = tweet.retweet_status?.user?.id_str;

  return (
    blackListedAccounts.includes(retweeterUserId) ||
    blackListedAccounts.includes(originalUserId)
  );
};

// TODO: Split this into multiple functions
/**
 * Store the given tweet in the database
 * @param {*} tweet - The tweet object
 * @return {Promise<Message | Error>}
 */
export const store = async (tweet: any): Promise<Message | Error> => {
  if (envs.DB_ENABLE === 'false') {
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

  const { id_str: userIdStr, screen_name, name } = user;

  try {
    const userId = await knex
      .select('user_id')
      .from('users')
      .where('user_id', userIdStr);

    if (userId.length) {
      await knex('users')
        .where('user_id', userIdStr)
        .update({
          user_id: userIdStr,
          screen_name,
          name,
        });
    } else {
      await knex('users').insert({
        user_id: userIdStr,
        screen_name,
        name,
      });
    }
  } catch (e) {
    return new Error(e);
  }

  try {
    const tweetId = await knex
      .select('tweet_id')
      .from('tweets')
      .where('tweet_id', id_str);

    if (!tweetId.length) {
      await knex('tweets').insert({
        tweet_id: id_str,
        text: $tweetText,
        source,
        is_retweet: isRetweet(tweet),
        in_reply_to_status_id,
        in_reply_to_user_id,
        user_id: user.id_str,
      });

      return { message: 'Tweet stored in the database' };
    }

    return { message: 'Tweet is already in the database' };
  } catch (e) {
    return new Error(e);
  }
};

/**
 * Whether the environment is in debug mode or not
 * @return {boolean}
 */
export const isDebugModeEnabled = (): boolean => envs.DEBUG_MODE === 'true';
