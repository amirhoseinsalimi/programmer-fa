const Twit = require('twit');
const _ = require('lodash');
const connection = require('./connection');

const config = require('./config');
const hashtagsToFollow = require('./hashtags');
const wordsToFollow = require('./words');
const {blackListedAccounts} = require('./black-listed-accounts');

const T = new Twit(config);

const interests = [];

for (const field in hashtagsToFollow) {
  hashtagsToFollow[field].map((val) => interests.push(val.toLowerCase()));
}

for (const field in wordsToFollow) {
  wordsToFollow[field].map((val) => interests.push(val.toLowerCase()));
}

const params = {
  track: interests,
};

const stream = T.stream('statuses/filter', params);

stream.on('tweet', (tweet) => {
  if (tweet.lang === 'fa') {
    let id = 0;
    const hashtagsOfCurrentTweet = [];

    // Retweet only if the tweet has 4 or less hashtags
    if (tweet.entities.hashtags.length <= 4) {
      for (const t in tweet.entities.hashtags) {
        tweet.entities.hashtags.map((val) => hashtagsOfCurrentTweet.push(`#${val.text}`));
      }

      if (!blackListedAccounts.includes(tweet.user.screen_name)) {
        console.log('=================================================');
        console.log(tweet);
        if (_.intersection(interests, hashtagsOfCurrentTweet).length) {
          id = tweet.id_str;
        } else {
          const tweetText = Object.prototype.hasOwnProperty.call(tweet, 'extended_tweet') ? tweet.extended_tweet.full_text : tweet.text;
          let tweetTextArr = tweetText.split(' ');
          tweetTextArr = tweetTextArr.map((word) => {
            return word.toLowerCase();
          });

          id = _.intersection(interests, tweetTextArr).length ? tweet.id_str : 0;
        }
      }

      if (id) {
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
});

stream.on('error', (err) => {
  // eslint-disable-next-line
  console.log(err);
});
