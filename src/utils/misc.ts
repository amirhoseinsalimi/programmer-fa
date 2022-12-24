import { readFileSync } from 'fs';
import envs from '../env';
import knex from '../knex-export';
import { makeHashtag } from './string';
import { isRetweet } from './tweet';
import { t } from './i18n';
import { Message } from '../types/general';

const blackListedAccounts: string[] = require('../data/accounts-not-to-follow.json');

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

export const isFileJSON = (fileName: string): boolean =>
  /\.(json)$/i.test(fileName);

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
    : new Error(t('fileDoesNotIncludeAnArray'));
};

export const isBlackListed = (tweet: any): boolean => {
  const originalUserId: string = tweet.user.id_str;
  const retweeterUserId: string = tweet.retweet_status?.user?.id_str;

  return (
    blackListedAccounts.includes(retweeterUserId) ||
    blackListedAccounts.includes(originalUserId)
  );
};

// TODO: Split this into multiple functions
export const store = async (tweet: any): Promise<Message | Error> => {
  if (envs.DB_ENABLE === 'false') {
    return {
      message: t('databaseStorageIsDisabled'),
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

      return { message: t('tweetStoredInTheDatabase') };
    }

    return { message: t('tweetIsAlreadyInTheDatabase') };
  } catch (e) {
    return new Error(e);
  }
};

export const isDebugModeEnabled = (): boolean => envs.DEBUG_MODE === 'true';
