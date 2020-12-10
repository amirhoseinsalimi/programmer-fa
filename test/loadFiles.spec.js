const { describe, it } = require('mocha');

const chai = require('chai');

const { expect } = chai;

const { readFile } = require('fs');

describe('Load files', () => {
  const BASE_DATA_DIR = `${__dirname}/../../src/data`;

  it('should import words to follow as an array of strings', (done) => {
    readFile(`${BASE_DATA_DIR}/words-to-follow.json`, (err, data) => {
      if (err) {
        done(err);
      } else {
        const wordsToFollow = JSON.parse(data.toString());

        expect(wordsToFollow)
          .to.be.an('array')
          .that.does.include('node js');

        done();
      }
    });
  });

  it('should import suspicious words as an array of strings', (done) => {
    readFile(`${BASE_DATA_DIR}/words-with-suspicion.json`, (err, data) => {
      if (err) {
        done(err);
      } else {
        const suspiciousWords = JSON.parse(data.toString());

        expect(suspiciousWords)
          .to.be.an('array')
          .that.does.include('django');

        done();
      }
    });
  });

  it('should import black-listed words as an array of strings', (done) => {
    readFile(`${BASE_DATA_DIR}/words-not-to-follow.json`, (err, data) => {
      if (err) {
        done(err);
      } else {
        const blackListedWords = JSON.parse(data.toString());

        expect(blackListedWords)
          .to.be.an('array')
          .that.does.include('استوری');

        done();
      }
    });
  });

  it('should import black-listed accounts as an array of numbers', (done) => {
    readFile(`${BASE_DATA_DIR}/accounts-not-to-follow.json`, (err, data) => {
      if (err) {
        done(err);
      } else {
        const blackListedAccounts = JSON.parse(data.toString());

        const allValuesAreNumbers = blackListedAccounts.every(
          (userId) => typeof +userId === 'number',
        );

        expect(blackListedAccounts).to.be.an('array');
        expect(allValuesAreNumbers).to.be.true;

        done();
      }
    });
  });
});
