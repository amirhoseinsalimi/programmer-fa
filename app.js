const Twit = require('twit');
const _ = require('lodash');

const hashtagsToFollow = require('./hashtags');
const config = require('./config');

const T = new Twit(config);

const hashtags = [];

for (const field in hashtagsToFollow) {
  hashtagsToFollow[field].map((val) => hashtags.push(val.toLowerCase()));
}

const params = {
  track: hashtags,
};

const stream = T.stream('statuses/filter', params);

stream.on('tweet', (tweet) => {
  if (tweet.lang === 'fa') {
    if (_.intersection(hashtags, tweet.entities.hashtags)) {
      const id = tweet.id_str;

      T.post('statuses/retweet/:id', { id }, () => {
      });
    }
  }
});

stream.on('error', (err) => {
  // eslint-disable-next-line
  console.log(err);
});
