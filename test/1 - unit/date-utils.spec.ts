import { describe, it } from 'mocha';
import {
  removeURLs,
  makeHashtag,
  getTweetLength,
  getNumberOfHashtags,
  removeSuspiciousWords,
  parseTwitterDateToLuxon,
} from '../../src/utils';

const chai = require('chai');

const { expect } = chai;

describe('Date Utils', () => {
  it('should return a `DateTime` object from a twitter data string', () => {
    const testCase = 'Wed Dec 23 13:28:54 +0000 2020';

    expect(parseTwitterDateToLuxon(testCase).isValid).to.equal(true);
  });
});
