/* =======================================
 *           Node.js Modules
 * ===================================== */
import { EventEmitter } from 'events';
import { T, Twit } from './twit';

/* =======================================
 *         My Modules and Utils
 * ===================================== */
import {
  logError,
  logSuccess,
  writeToFile,
  printWelcomeBanner,
} from './logger';

import {
  getTweetFullText,
  isDebugModeEnabled,
  retweet,
  favourite,
  store,
  removeSuspiciousWords,
  removeURLs,
  getIntersectionCount,
  hasURLs,
  isRetweeted,
  validateInitialTweet,
  removeRetweetNotation,
} from './utils';

/* =======================================
 *            Error Handling
 * ==================================== */
class Emitter extends EventEmitter {}

const emitter: Emitter = new Emitter();

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

/* =======================================
 *                 Bot
 * ==================================== */
printWelcomeBanner();

const wordsToFollow: string[] = require('../data/words.json');
const blackListedWords: string[] = require('../data/black-listed-words.json');

const interests: string[] = [];

// Include hashtags in a single array
wordsToFollow.forEach((val: string) => interests.push(val.toLowerCase()));
wordsToFollow.forEach((word: string) => {
  let w: string;

  // Replace space and half-space w/ an underscore
  w = word.replace(/[ ‌]/g, '_');
  // Add a number sign at the beginning of the word
  w = `#${w}`;

  interests.push(w);
});

const params: Twit.Params = {
  // track these words
  track: interests,
};

const stream: Twit.Stream = T.stream('statuses/filter', params);

/**
 * onTweet handler - Runs for each tweet that comes from the stream
 * @param tweet - The tweet object
 * @return void
 */
const onTweet = (tweet: any): void => {
  tweet.$tweetText = removeRetweetNotation(getTweetFullText(tweet));

  if (!validateInitialTweet(tweet)) {
    return;
  }

  const hashtagsOfCurrentTweet: string[] = [];

  tweet.entities.hashtags.map((val: { text: string }) => (
    hashtagsOfCurrentTweet.push(`#${val.text}`)
  ));

  let id = 0;

  if (getIntersectionCount(interests, hashtagsOfCurrentTweet)) {
    id = tweet.id_str;
  } else {
    const tweetTextWithoutURLs: string = removeURLs(tweet.$tweetText);

    const tweetTextWithoutSuspiciousWords: string = removeSuspiciousWords(
      tweetTextWithoutURLs,
    );

    const hasInterestingWords: boolean = interests.some(
      (interest: string) => (
        tweetTextWithoutSuspiciousWords.search(
          new RegExp(interest.toLowerCase()),
        ) > -1
      ),
    );

    const hasUninterestingWords: boolean = blackListedWords.some(
      (blackListedWord: string) => (
        tweetTextWithoutSuspiciousWords.search(
          new RegExp(blackListedWord.toLowerCase()),
        ) > -1
      ),
    );

    id = hasInterestingWords
    && !hasUninterestingWords
    && !hasURLs(tweet)
    && !isRetweeted(tweet)
      ? tweet.id_str
      : 0;
  }

  if (id) {
    if (isDebugModeEnabled()) {
      writeToFile(tweet.$tweetText);
    } else {
      retweet(id)
        .then(({ message }) => {
          logSuccess(message);

          favourite(id)
            .then(({ message: m }) => {
              logSuccess(m);
            })
            .catch((err) => {
              emitter.emit('bot-error', err);
            });
        })
        .catch((err) => {
          emitter.emit('bot-error', err);
        });
    }

    store(tweet)
      .then(({ message }) => {
        logSuccess(message);
      })
      .catch((err) => {
        emitter.emit('bot-error', err);
      });
  }
};

stream.on('tweet', onTweet);

stream.on('error', (err: any) => {
  emitter.emit('bot-error', err);
});
