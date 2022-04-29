import { T } from '../twit';
import { getTweetLength, hasFiveHashtagsOrMore } from './string.util';
import { hasUserRegisteredRecently } from './date.util';
import { isBlackListed } from './misc.util';
import {Message} from "../types/general";

/**
 * Whether a tweet is a retweet or not.
 * @param tweet
 * @return {boolean}
 */
export const isRetweet = (tweet: any): boolean =>
  Object.prototype.hasOwnProperty.call(tweet, 'retweeted_status');

/**
 * Check if a tweet is retweeted by ME or not
 * @param {*} tweet - The tweet object
 * @return {boolean}
 */
export const isRetweetedByMyself = (tweet: any): boolean => tweet.retweeted;

/**
 * Whether a tweet is a reply or not.
 * @param {*} tweet - The tweet object
 * @return {boolean}
 */
export const isTweetAReply = (tweet: any): boolean =>
  // Polyfill to check whether a tweet is a reply or not
  (tweet.in_reply_to_status_id || tweet.in_reply_to_user_id || isRetweet(tweet)
    ? tweet.retweeted_status || tweet.in_reply_to_status_id
    : false);

/**
 * Whether a tweet is in Farsi or not.
 * This behaviour relies on Twitter API.
 * @param {*} tweet - The tweet object
 * @return boolean
 */
export const isTweetFarsi = (tweet: any): boolean => tweet.lang === 'fa';

/**
 * Validate the tweet properties for further process:
 *   1. Checks whether the language of the tweet is Farsi
 *   2. Checks whether the tweet is a reply
 *   3. Checks whether the tweet has five or more hashtags "#"
 *   4. Checks whether the user is blocked
 *   5. Checks whether the text of the tweet is longer than 10 characters
 *   6. Checks whether the user has registered recently
 * @param {*} tweet - The tweet object
 * @return {boolean} - Whether the tweet is acceptable
 */
export const isTweetAcceptable = (tweet: any): boolean => {
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

  if (getTweetLength(tweet.text) <= 10) {
    return false;
  }

  if (hasUserRegisteredRecently(tweet)) {
    return false;
  }

  return true;
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
 * Whether a tweet is under 140 characters long or not
 * @param {*} tweet - The tweet object
 * @return {boolean}
 */
export const isTweetExtended = (tweet: any): boolean =>
  tweet.truncated === true;

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
 *
 * @param {*} tweet - The tweet object
 * @return {string[]}
 */
export const getTweetHashtags = (tweet: any): string[] =>
  tweet.entities.hashtags;
