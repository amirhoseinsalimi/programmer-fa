const twit = require('twit');
const _ = require('lodash');

const hashtagsToFollow = require('./hashtags');
const config = require('./config');

const T = new twit(config);

const hashtags = [];

for (let field in hashtagsToFollow) {
  hashtagsToFollow[field].map((val, index) => {
    return hashtags.push(val.toLowerCase());
  });
}

const params = {
  track: hashtags
};

const stream = T.stream('statuses/filter', params);

stream.on('tweet', (tweet) => {
  if (tweet.lang === 'fa' || tweet.lang === 'ar') {
    if (_.intersection(hashtags, tweet.entities.hashtags)) {
      const id = tweet.id_str;

      T.post('statuses/retweet/:id', { id }, function (err, data, response) {
      });
    }

  }
});

stream.on('error', (err) => {
  console.log(err);
});
