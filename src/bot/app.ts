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
  prettyPrintInTable,
  printWelcomeBanner,
  writeToFile,
} from './logger';

import {
  favourite,
  fillArrayWithWords,
  getTweetFullText,
  hasURLs,
  isDebugModeEnabled,
  isRetweet,
  isRetweetedByMyself,
  loadJSONFileContent,
  removeRetweetNotation,
  removeSuspiciousWords,
  removeURLs,
  retweet,
  store,
  validateInitialTweet,
} from './utils';

/* =======================================
 *            Error Handling
 * ==================================== */
class Emitter extends EventEmitter {}

const emitter: Emitter = new Emitter();

emitter.on('bot-error', (err: Error) => {
  logError('An error has been thrown', err.message || err);
});

/* Deal w/ uncaught errors and unhandled promises */
process
  .on('uncaughtException', (err: Error) => {
    logError(`${new Date().toUTCString()} "uncaughtException": ${err.message}`);
    logError(err.stack);
    process.exit(1);
  })
  .on('unhandledRejection', (reason, p: Promise<unknown>) => {
    logError('Unhandled Rejection at Promise', p);
    logError(reason);
  });

/* =======================================
 *                 Bot
 * ==================================== */
printWelcomeBanner();

const wordsToFollowDB: string[] | Error = loadJSONFileContent(
  `${__dirname}/../data/words-to-follow.json`,
);
const wordsNotToFollowDB: string[] | Error = loadJSONFileContent(
  `${__dirname}/../data/words-not-to-follow.json`,
);

if (wordsToFollowDB instanceof Error || wordsNotToFollowDB instanceof Error) {
  emitter.emit('bot-error', "Files couldn't be loaded");
  process.exit(1);
}

let interestingWords: string[] = [];

interestingWords = fillArrayWithWords(interestingWords, wordsToFollowDB);

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
export const onTweet = async (tweet: any): Promise<number> => {
  if (!validateInitialTweet(tweet)) {
    return 0;
  }

  tweet.$tweetText = removeRetweetNotation(getTweetFullText(tweet));

  tweet.$retweetText = '';

  if (isRetweet(tweet)) {
    tweet.$retweetText = removeRetweetNotation(
      getTweetFullText(tweet.retweeted_status),
    );
  }

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

  const tweetId: number = tweetIncludesInterestingWords
    && !tweetIncludesBlackListedWords
    && !retweetIncludesBlackListedWords
    && !hasURLs(tweet)
    && !isRetweetedByMyself(tweet) ? tweet.id : 0;

  if (tweetId) {
    if (isDebugModeEnabled()) {
      try {
        await writeToFile(tweet.$tweetText);
        prettyPrintInTable(tweet);
      } catch (e) {
        emitter.emit('bot-error', e);
      }
    } else {
      try {
        logSuccess(await retweet(tweetId));
      } catch (e) {
        emitter.emit('bot-error', e);
      }

      try {
        logSuccess(await favourite(tweetId));
      } catch (e) {
        emitter.emit('bot-error', e);
      }
    }

    try {
      logSuccess(await store(tweet));
    } catch (e) {
      emitter.emit('bot-error', e);
    }
  }

  return tweetId;
};

stream.on('tweet', onTweet);

stream.on('error', (err: Error) => {
  emitter.emit('bot-error', err);
});
