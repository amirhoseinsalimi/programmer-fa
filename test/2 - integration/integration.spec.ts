import { describe, it, before } from 'mocha';
import * as supertest from 'supertest';
import {
  getNumberOfHashtags,
  fillArrayWithWords,
  loadJSONFileContent,
  makeHashtag, removeRetweetNotation, getTweetFullText,
} from '../../src/bot/utils';
import { onTweet } from '../../src/bot/app';

const chai = require('chai');
const chaiHttp = require('chai-http');
const createServer = require('../0 - express-server/server');

chai.use(chaiHttp);

const { expect } = chai;

const app = createServer();

describe('Integration Tests', () => {
  const BASE_DATA_DIR = `${__dirname}/../../src/data`;
  const WORDS_TO_FOLLOW_FILE_PATH = 'words-to-follow.json';
  const WORDS_NOT_TO_FOLLOW_FILE_PATH = 'words-not-to-follow.json';

  let tweets: any[];

  before(async () => {
    await supertest(app)
      .get('/tweets')
      .expect(200)
      .then(async (response) => {
        tweets = JSON.parse(response.text).tweets;
      });
  });

  it('should return an array including "words to follow", both in plain form and in hashtag form', (done) => {
    const wordsToFollow = loadJSONFileContent(`${BASE_DATA_DIR}/${WORDS_TO_FOLLOW_FILE_PATH}`) as string[];
    let interestingWords: string[] = [];

    interestingWords = fillArrayWithWords(
      interestingWords,
      wordsToFollow as string[],
    );

    const allExpectedValuesAreInInterestedWordsArray = wordsToFollow.every((word: string) => (
      interestingWords.includes(word) && interestingWords.includes(makeHashtag(word))
    ));

    expect(allExpectedValuesAreInInterestedWordsArray).to.be.true;

    done();
  });

  it('should return an array including "words not to follow", both in plain form and in hashtag form', (done) => {
    const wordsNotToFollow = loadJSONFileContent(`${BASE_DATA_DIR}/${WORDS_NOT_TO_FOLLOW_FILE_PATH}`) as string[];
    let blacklistedWords: string[] = [];

    blacklistedWords = fillArrayWithWords(
      blacklistedWords,
      wordsNotToFollow as string[],
    );

    const allExpectedValuesAreInBlackListedWordsArray = wordsNotToFollow.every((word: string) => (
      blacklistedWords.includes(word) && blacklistedWords.includes(makeHashtag(word))
    ));

    expect(allExpectedValuesAreInBlackListedWordsArray).to.be.true;

    done();
  });

  it('should properly count number of hashtags', (done) => {
    const hashtagsGetsCountedProperly = tweets.every(
      // TODO: Make a type for this
      (tweet: { text: string; numberOfHashtags: number }) => (
        tweet.numberOfHashtags
        === getNumberOfHashtags(
          removeRetweetNotation(getTweetFullText(tweet)),
        )
      ),
    );

    expect(hashtagsGetsCountedProperly).to.be.true;

    done();
  });

  it('should return the `id` of valid tweets or `0` for invalid tweets', (done) => {
    tweets.forEach(
      (tweet: any) => {
        if (tweet.tweetIsValid) {
          expect(onTweet(tweet))
            .to.be.not.equal(0);
        } else {
          expect(onTweet(tweet))
            .to.be.equal(0);
        }
      },
    );
    done();
  });
});
