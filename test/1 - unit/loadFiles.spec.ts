import { describe, it } from 'mocha';
import { loadJSONFileContent } from '../../src/bot/utils';

const chai = require('chai');

const { expect } = chai;

describe('Load files', () => {
  const BASE_DATA_DIR = `${__dirname}/../../src/data`;
  const WORDS_TO_FOLLOW_FILE_PATH = 'words-to-follow.json';
  const WORDS_NOT_TO_FOLLOW_FILE_PATH = 'words-not-to-follow.json';
  const WORDS_WITH_SUSPICION_FILE_PATH = 'words-with-suspicion.json';
  const ACCOUNTS_NOT_TO_FOLLOW_FILE_PATH = 'accounts-not-to-follow.json';

  let wordsToFollow: string[] | Error;
  let wordsNotToFollow: string[] | Error;
  let suspiciousWords: string[] | Error;
  let blackListedAccountIDs: string[] | Error;

  it(`should load ${WORDS_TO_FOLLOW_FILE_PATH} content and it should contain array of strings`, (done) => {
    wordsToFollow = loadJSONFileContent(`${BASE_DATA_DIR}/${WORDS_TO_FOLLOW_FILE_PATH}`);

    if (wordsToFollow instanceof Error) {
      done(wordsToFollow);
    } else {
      expect(wordsToFollow)
        .to.be.an('array')
        .that.does.include('node js');

      done();
    }
  });

  it(`should load ${WORDS_NOT_TO_FOLLOW_FILE_PATH} content and it should contain an array of strings`, (done) => {
    wordsNotToFollow = loadJSONFileContent(`${BASE_DATA_DIR}/${WORDS_NOT_TO_FOLLOW_FILE_PATH}`);

    if (wordsNotToFollow instanceof Error) {
      done(wordsNotToFollow);
    } else {
      expect(wordsNotToFollow)
        .to.be.an('array')
        .that.does.include('استوری');

      done();
    }
  });

  it(`should load ${WORDS_WITH_SUSPICION_FILE_PATH} content and it should contain an array of strings`, (done) => {
    suspiciousWords = loadJSONFileContent(`${BASE_DATA_DIR}/${WORDS_WITH_SUSPICION_FILE_PATH}`);

    if (suspiciousWords instanceof Error) {
      done(suspiciousWords);
    } else {
      expect(suspiciousWords)
        .to.be.an('array')
        .that.does.include('django');

      done();
    }
  });

  it(`should load ${ACCOUNTS_NOT_TO_FOLLOW_FILE_PATH} content and it should contain an array of numbers`, (done) => {
    blackListedAccountIDs = loadJSONFileContent(`${BASE_DATA_DIR}/${ACCOUNTS_NOT_TO_FOLLOW_FILE_PATH}`);

    if (blackListedAccountIDs instanceof Error) {
      done(blackListedAccountIDs);
    } else {
      const allValuesAreNumbers = blackListedAccountIDs.every(
        (userId: string) => typeof +userId === 'number',
      );

      expect(blackListedAccountIDs).to.be.an('array');
      expect(allValuesAreNumbers).to.be.true;

      done();
    }
  });
});
