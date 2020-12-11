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
  prettyPrintInTable,
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
  isRetweetedByMyself,
  validateInitialTweet,
  removeRetweetNotation,
  isRetweet,
  loadJSONFileContent,
} from './utils';

/* =======================================
 *            Error Handling
 * ==================================== */
class Emitter extends EventEmitter {}

const emitter: Emitter = new Emitter();

emitter.on('bot-error', (err: any) => {
  logError('An error has been thrown', err.message || err);
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

const wordsToFollowDB: string[] | Error = loadJSONFileContent(`${__dirname}/../data/words-to-follow.json`);
const wordsNotToFollowDB: string[] | Error = loadJSONFileContent(`${__dirname}/../data/words-not-to-follow.json`);

if (wordsToFollowDB instanceof Error || wordsNotToFollowDB instanceof Error) {
  emitter.emit('bot-error', "Files couldn't be loaded");
  process.exit(1);
}

const interestingWords: string[] = [];

// Include hashtags in a single array
wordsToFollowDB.forEach((word: string) => interestingWords.push(word));
wordsToFollowDB.forEach((word: string) => {
  let w: string;

  // Replace space and half-space w/ an underscore
  w = word.replace(/[ ‌]/gi, '_');
  // Add a number sign at the beginning of the word
  w = `#${w}`;

  interestingWords.push(w);
});

const params: Twit.Params = {
  // track these words
  track: interestingWords,
};

// eslint-disable-next-line import/prefer-default-export
export const stream: Twit.Stream = T.stream('statuses/filter', params);

/**
 * onTweet handler - Runs for each tweet that comes from the stream
 * @param tweet - The tweet object
 * @return void
 */
const onTweet = (tweet: any): void => {
  if (!validateInitialTweet(tweet)) {
    return;
  }

  const hashtagsOfCurrentTweet: string[] = [];
  tweet.$tweetText = removeRetweetNotation(getTweetFullText(tweet));

  tweet.$retweetText = '';

  if (isRetweet(tweet)) {
    tweet.$retweetText = removeRetweetNotation(getTweetFullText(tweet.retweeted_status));
  }

  tweet.entities.hashtags.map((val: { text: string }) => (
    hashtagsOfCurrentTweet.push(`#${val.text}`)
  ));

  let tweetId = 0;

  if (getIntersectionCount(interestingWords, hashtagsOfCurrentTweet)) {
    tweetId = tweet.id_str;
  } else {
    const tweetTextWithoutURLs: string = removeURLs(tweet.$tweetText);
    const reTweetTextWithoutURLs: string = removeURLs(tweet.$retweetText);

    const tweetTextWithoutSuspiciousWords: string = removeSuspiciousWords(
      tweetTextWithoutURLs,
    );
    const retweetTextWithoutSuspiciousWords: string = removeSuspiciousWords(
      reTweetTextWithoutURLs,
    );

    const tweetIncludesInterestingWords: boolean = interestingWords.some(
      (word: string) => (
        tweetTextWithoutSuspiciousWords.search(
          new RegExp(word.toLowerCase()),
        ) > -1
      ),
    );

    const tweetIncludesBlackListedWords: boolean = wordsNotToFollowDB.some(
      (word: string) => (
        tweetTextWithoutSuspiciousWords.search(
          new RegExp(word.toLowerCase()),
        ) > -1
      ),
    );

    const retweetIncludesBlackListedWords: boolean = wordsNotToFollowDB.some(
      (blackListedWord: string) => (
        retweetTextWithoutSuspiciousWords.search(
          new RegExp(blackListedWord.toLowerCase()),
        ) > -1
      ),
    );

    tweetId = tweetIncludesInterestingWords
      && !tweetIncludesBlackListedWords
      && !retweetIncludesBlackListedWords
      && !hasURLs(tweet)
      && !isRetweetedByMyself(tweet) ? tweet.id_str : 0;
  }

  if (tweetId) {
    if (isDebugModeEnabled()) {
      writeToFile(tweet.$tweetText);
      prettyPrintInTable(tweet);
    } else {
      retweet(tweetId)
        .then(({ message }) => {
          logSuccess(message);

          favourite(tweetId)
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
