/*=======================================
 *           Node.js Modules
 * ====================================*/
import * as Twit from 'twit';
import { EventEmitter } from 'events';

/*=======================================
 *            Configuration
 * ====================================*/
const {
  CONSUMER_KEY: consumer_key,
  CONSUMER_SECRET: consumer_secret,
  ACCESS_TOKEN: access_token,
  ACCESS_TOKEN_SECRET: access_token_secret,
  STRICT_SSL: strictSSL,
} = require('../../env');

const T: Twit = new Twit({
  consumer_key,
  consumer_secret,
  access_token,
  access_token_secret,
  timeout_ms: 60 * 1000,
  strictSSL: !!strictSSL,
});

/*=======================================
 *         My Modules and Utils
 * ====================================*/
import {
  logError,
  logSuccess,
  writeToFile,
  printWelcomeBanner,
} from './logger';
import { hashtagsToFollow } from './hashtags';
import { wordsToFollow } from './words';
import { blackListedWords } from './black-listed-words';
import {
  getTweetFullText,
  isDebugModeEnabled,
  isTweetFarsi,
  isTweetNotAReply,
  retweet,
  favourite,
  store,
  removeSuspiciousWords,
  removeURLs,
  isNotBlackListed,
  getIntersectionCount,
  hasLessThanFourHashtags,
  hasURLs,
  isRetweeted,
} from './utils';

/*=======================================
 *                 Bot
 * ====================================*/
printWelcomeBanner();

const interests: string[] = [];

// Include hashtags in a single array
hashtagsToFollow.map((val: string) => interests.push(val.toLowerCase()));
wordsToFollow.map((val: string) => interests.push(val.toLowerCase()));

const params: Twit.Params = {
  // track these words
  track: interests,
};

const stream = T.stream('statuses/filter', params);

stream.on('tweet', (tweet) => {
  if (isTweetFarsi(tweet) && isTweetNotAReply(tweet)) {
    const hashtagsOfCurrentTweet: string[] = [];

    tweet.$tweetText = getTweetFullText(tweet);

    if (hasLessThanFourHashtags(tweet)) {
      for (const t in tweet.entities.hashtags) {
        tweet.entities.hashtags.map((val: { text: any }) =>
          hashtagsOfCurrentTweet.push(`#${val.text}`)
        );
      }

      let id: number = 0;

      if (isNotBlackListed(tweet)) {
        if (getIntersectionCount(interests, hashtagsOfCurrentTweet)) {
          id = tweet.id_str;
        } else {
          const tweetTextWithoutURLs: string = removeURLs(tweet.$tweetText);

          const tweetTextWithoutSuspiciousWords: string = removeSuspiciousWords(
            tweetTextWithoutURLs
          );

          const hasInterestingWords: boolean = interests.some((interest) => {
            return (
              tweetTextWithoutSuspiciousWords.search(
                new RegExp(interest.toLowerCase())
              ) > -1
            );
          });

          const hasUninterestingWords: boolean = blackListedWords.some(
            (blackListedWord) => {
              return (
                tweetTextWithoutSuspiciousWords.search(
                  new RegExp(blackListedWord.toLowerCase())
                ) > -1
              );
            }
          );

          id =
            hasInterestingWords &&
            !hasUninterestingWords &&
            !hasURLs(tweet) &&
            !isRetweeted(tweet)
              ? tweet.id_str
              : 0;
        }
      }

      if (id) {
        if (!isDebugModeEnabled()) {
          retweet(id)
            .then(({ message }) => {
              logSuccess(message);

              favourite(id)
                .then(({ message }) => {
                  logSuccess(message);
                })
                .catch((err) => {
                  emitter.emit('bot-error', err);
                });
            })
            .catch((err) => {
              emitter.emit('bot-error', err);
            });
        } else {
          writeToFile(tweet.$tweetText);
        }

        store(tweet)
          .then(({ message }) => {
            logSuccess(message);
          })
          .catch((err) => {
            emitter.emit('bot-error', err);
          });
      }
    }
  }
});

/*=======================================
 *            Error Handling
 * ====================================*/
class Emitter extends EventEmitter {}

const emitter = new Emitter();

stream.on('error', (err: any) => {
  emitter.emit('bot-error', err);
});

emitter.on('bot-error', (err: any) => {
  logError('An error has been thrown', err.message);
});

/* Deal w/ uncaught errors and unhandled promises */
process
  .on('uncaughtException', (err: Error) => {
    logError(`${new Date().toUTCString()} "uncaughtException": ${err.message}`);
    logError(err.stack);
    process.exit(1);
  })
  .on('unhandledRejection', (reason, p: Promise<any>) => {
    logError('Unhandled Rejection at Promise', p);
    logError(reason);
  });

/*=======================================
 *                Export
 * ====================================*/
export { T };
