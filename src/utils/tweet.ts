import { T } from '../twit';
import { getTweetLength, hasFiveHashtagsOrMore } from './string';
import { hasUserRegisteredRecently } from './date';
import { isBlackListed } from './misc';
import { Message } from '../types/general';

export const isRetweet = (tweet: any): boolean =>
  Object.prototype.hasOwnProperty.call(tweet, 'retweeted_status');

export const isRetweetedByMyself = (tweet: any): boolean => tweet.retweeted;

export const isTweetAReply = (tweet: any): boolean =>
  // Polyfill to check whether a tweet is a reply or not
  tweet.in_reply_to_status_id || tweet.in_reply_to_user_id || isRetweet(tweet)
    ? tweet.retweeted_status || tweet.in_reply_to_status_id
    : false;

export const isTweetFarsi = (tweet: any): boolean => tweet.lang === 'fa';

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

export const isTweetExtended = (tweet: any): boolean =>
  tweet.truncated === true;

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

export const getTweetHashtags = (tweet: any): string[] =>
  tweet.entities.hashtags;
