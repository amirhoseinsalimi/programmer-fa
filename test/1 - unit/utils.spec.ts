import { describe, it } from 'mocha';
import {
  getNumberOfHashtags,
  makeHashtag,
  removeSuspiciousWords,
  removeURLs,
  getTweetLength,
  parseTwitterDateToLuxon,
} from '../../src/bot/utils';

const chai = require('chai');

const { expect } = chai;

describe('Unit tests', () => {
  it('should properly count the number of hashtags', ((done) => {
    const testCase = 'سلام این یک متن جاوا #اسکریپتی می‌باشد. و این #جمله هم دارای تعدادی، #هشتگ است';

    expect(getNumberOfHashtags(testCase)).to.equal(3);

    done();
  }));

  it('should remove suspicious words from a string', ((done) => {
    const testCase = 'سلام این یک متن است که دارای کلمات جنگو و روبی و پایتون و چند تای دیگر است که این اسامی باید حذف شوند.';

    expect(removeSuspiciousWords(testCase)).to.equal('سلام این یک متن است که دارای کلمات جنگو و و و چند تای دیگر است که این اسامی باید حذف شوند.');

    done();
  }));

  it('should remove all URLs from a string', ((done) => {
    const testCase = 'سلام این یک متن است که شامل چندین URL هست که باید حذف شوند: https://google.com http://www.google.com یکی دیگه: http://google.com/ اینم آخری: google.com';

    expect(removeURLs(testCase))
      .to.equal('سلام این یک متن است که شامل چندین url هست که باید حذف شوند: یکی دیگه: / اینم آخری:');

    done();
  }));

  it('should convert a string to hashtag', (done) => {
    const testCase = 'سلام این یک متن جاوا اسکریپتی می‌باشد. و این کلمه هم دارای خط-تیره است';

    expect(makeHashtag(testCase)).to.equal('#سلام_این_یک_متن_جاوا_اسکریپتی_می_باشد_و_این_کلمه_هم_دارای_خط_تیره_است');

    done();
  });

  it('should properly count the characters of a tweet', (done) => {
    const testCase = 'سلام این یک متن جاوا اسکریپتی می‌باشد. و این کلمه هم دارای خط-تیره است';

    expect(getTweetLength(testCase)).to.equal(70);

    done();
  });

  it('should return a `DateTime` object from a twitter data string', () => {
    const testCase = 'Wed Dec 23 13:28:54 +0000 2020';

    expect(parseTwitterDateToLuxon(testCase).isValid).to.equal(true);
  })
});
