import { describe, it } from 'mocha';
import {
  makeHashtag,
} from '../../src/bot/utils';

const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const { expect } = chai;

describe('Unit tests', () => {
  it('should convert a string to hashtag', (done) => {
    const testCase = 'سلام این یک متن جاوا اسکریپتی می‌باشد. و این کلمه هم دارای خط-تیره است';

    expect(makeHashtag(testCase)).to.equal('#سلام_این_یک_متن_جاوا_اسکریپتی_می_باشد_و_این_کلمه_هم_دارای_خط_تیره_است');

    done();
  });
});
