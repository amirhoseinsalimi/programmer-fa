const Twit = require('twit');
const _ = require('lodash');
const connection = require('./connection');

const config = require('./config');
const hashtagsToFollow = require('./hashtags');
const { blackListedAccounts } = require('./black-listed-accounts');

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
    const hashtagsOfCurrentTweet = [];

    // Retweet only if the tweet has 4 or less hashtags
    if (tweet.entities.hashtags.length <= 4) {
      for (const t in tweet.entities.hashtags) {
        tweet.entities.hashtags.map((val) => hashtagsOfCurrentTweet.push(`#${val.text}`));
      }

      if (_.intersection(hashtags, hashtagsOfCurrentTweet).length) {
        const id = tweet.id_str;

        if (!blackListedAccounts.includes(tweet.user.screen_name)) {
          T.post('statuses/retweet/:id', {id}, () => {
            const query = 'INSERT INTO `tweets` (tweet_id, tweet_text, user_name, user_id, created_at) VALUES (?, ?, ?, ?, ?)';
            T.post('/favorites/create', {id}, () => {
              connection.query(query, [
                tweet.id_str,
                Object.prototype.hasOwnProperty.call(tweet, 'extended_tweet') ? tweet.extended_tweet.full_text : tweet.text,
                tweet.user.screen_name,
                tweet.user.id,
                tweet.created_at,
              ], (err) => {
                if (err) {
                  console.log(err);
                }
              });
            });
          });
        }
      }
    }
  }
});

stream.on('error', (err) => {
  // eslint-disable-next-line
  console.log(err);
});
