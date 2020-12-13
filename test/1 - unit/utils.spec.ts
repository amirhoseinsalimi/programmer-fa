import { describe, it } from 'mocha';
import {
  getNumberOfIntersections,
  makeHashtag,
} from '../../src/bot/utils';

const chai = require('chai');

const { expect } = chai;

describe('Unit tests', () => {
  it('should convert a string to hashtag', (done) => {
    const testCase = 'سلام این یک متن جاوا اسکریپتی می‌باشد. و این کلمه هم دارای خط-تیره است';

    expect(makeHashtag(testCase)).to.equal('#سلام_این_یک_متن_جاوا_اسکریپتی_می_باشد_و_این_کلمه_هم_دارای_خط_تیره_است');

    done();
  });

  it('should properly count the intersections of two arrays', (done) => {
    const fruitsA = ['Apple', 'Orange', 'Banana'];
    const fruitsB = ['Banana', 'Kiwi', 'Watermelon', 'Strawberry', 'Apple'];
    const numberOfIntersectionsOfFruits = 2;

    const animalsA = ['Monkey', 'Cat', 'Dog'];
    const animalsB = ['Wolf', 'Elephant', 'Gorilla', 'Ant', 'Fly'];
    const numberOfIntersectionsOfAnimals = 0;

    expect(numberOfIntersectionsOfFruits)
      .to.equal(getNumberOfIntersections(fruitsA, fruitsB));

    expect(numberOfIntersectionsOfAnimals)
      .to.equal(getNumberOfIntersections(animalsA, animalsB));

    done();
  });
});
