import { describe, it } from 'mocha';
import {
  getNumberOfHashtags,
  fillArrayWithWords,
  loadJSONFileContent,
  makeHashtag,
} from '../../src/bot/utils';

const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const { expect } = chai;

describe('Test utility functions', () => {
  const BASE_DATA_DIR = `${__dirname}/../../src/data`;
  const WORDS_TO_FOLLOW_FILE_PATH = 'words-to-follow.json';
  const WORDS_NOT_TO_FOLLOW_FILE_PATH = 'words-not-to-follow.json';

  it('should properly count number of hashtags', (done) => {
    chai.request('http://localhost:3000')
      .get('/tweets')
      .end((err: any, response: any) => {
        if (err) {
          done(err);
        } else {
          const tweets = JSON.parse(response.text);

          expect(response).to.have.status(200);
          expect(tweets).to.be.an('array');

          const hashtagsGetsCountedProperly = tweets.every(
            (tweet: { text: string; numberOfHashtags: number }) => (
              tweet.numberOfHashtags === getNumberOfHashtags(tweet.text)
            ),
          );

          expect(hashtagsGetsCountedProperly).to.be.true;

          done();
        }
      });
  });

  it('should convert a string to hashtag', (done) => {
    const testCase = 'سلام این یک متن جاوا اسکریپتی می‌باشد. و این کلمه هم دارای خط-تیره است';

    expect(makeHashtag(testCase)).to.equal('#سلام_این_یک_متن_جاوا_اسکریپتی_می_باشد_و_این_کلمه_هم_دارای_خط_تیره_است');

    done();
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
});
