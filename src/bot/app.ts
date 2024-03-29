import { EventEmitter } from 'events';
import { T, Twit } from '../twit';

import {
  logError,
  logSuccess,
  prettyPrintInTable,
  printWelcomeBanner,
  writeToFile,
} from './logger';

import {
  t,
  store,
  hasURL,
  retweet,
  isRetweet,
  favourite,
  removeURLs,
  isTweetAcceptable,
  getTweetFullText,
  isDebugModeEnabled,
  fillArrayWithWords,
  loadJSONFileContent,
  isRetweetedByMyself,
  removeSuspiciousWords,
  removeRetweetNotation,
} from '../utils';

class Emitter extends EventEmitter {}

const emitter: Emitter = new Emitter();

emitter.on('bot-error', (err: Error, tweet: any, tweetId: string) => {
  logError(t('anErrorHasBeenThrown'), err.message || err);
  if (tweetId !== '0') logError(t('errorOnHandlingTweetId', { tweetId }));
  if (tweetId !== '0' && tweet) logError(JSON.stringify(tweet));
});

/* Deal w/ uncaught errors and unhandled promises */
process
  .on('uncaughtException', (err: Error) => {
    logError(JSON.stringify(err, null, 2));
    logError(`${new Date().toUTCString()} "uncaughtException": ${err.message}`);
    logError(err.stack);
    process.exit(1);
  })
  .on('unhandledRejection', (reason, p: Promise<unknown>) => {
    logError(t('unhandledRejectionAtPromise'), p);
    logError(reason);
  });

printWelcomeBanner();

const wordsToFollowDB: string[] | Error = loadJSONFileContent(
  `${__dirname}/../data/words-to-follow.json`,
);
const wordsNotToFollowDB: string[] | Error = loadJSONFileContent(
  `${__dirname}/../data/words-not-to-follow.json`,
);

if (wordsToFollowDB instanceof Error || wordsNotToFollowDB instanceof Error) {
  emitter.emit('bot-error', t('filesCouldNotLoad'));
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

export const onTweet = async (tweet: any): Promise<string> => {
  if (!isTweetAcceptable(tweet)) {
    return '0';
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

  const tweetId: string = tweetIncludesInterestingWords
    && !tweetIncludesBlackListedWords
    && !retweetIncludesBlackListedWords
    && !hasURL(tweet)
    && !isRetweetedByMyself(tweet) ? tweet.id_str : '0';

  if (tweetId === '0') {
    return '0';
  }

  try {
    if (isDebugModeEnabled()) {
      await writeToFile(tweet.$tweetText);
      prettyPrintInTable(tweet);
    } else {
      logSuccess((await retweet(tweetId)).message);
      logSuccess((await favourite(tweetId)).message);
    }

    logSuccess((await store(tweet)).message);
  } catch (e) {
    emitter.emit('bot-error', e, tweetId, tweet);
  }

  return tweetId;
};

stream.on('tweet', onTweet);

stream.on('error', (err: Error) => {
  emitter.emit('bot-error', err);
});
