import * as Twit from 'twit';
import * as _ from 'lodash';
import { MysqlError } from 'mysql';

import { config } from './config';
import { connection } from './connection';

import { hashtagsToFollow } from './hashtags';
import { wordsToFollow } from './words';
import { blackListedAccounts } from './black-listed-accounts';
import { blackListedWords } from './black-listed-words';
import {
  getAllOccurrences,
  getTweetFullText,
  isEnvRestricted,
  isTweetFarsi,
  isTweetNotAReply,
} from './utils';

const T: Twit = new Twit(config);

const interests: string[] = [];

for (const field in hashtagsToFollow) {
  // @ts-ignore
  hashtagsToFollow[field].map((val: string) =>
    interests.push(val.toLowerCase())
  );
}

for (const field in wordsToFollow) {
  // @ts-ignore
  wordsToFollow[field].map((val: string) => interests.push(val.toLowerCase()));
}

const params: Twit.Params = {
  track: interests,
};

const stream = T.stream('statuses/filter', params);

stream.on('tweet', (tweet) => {
  const tweetText: string = getTweetFullText(tweet);

  if (isTweetFarsi(tweet) && isTweetNotAReply(tweet)) {
    let id: number = 0;
    const hashtagsOfCurrentTweet: string[] = [];

    if (
      getAllOccurrences('#', tweetText, true).length <= 4 &&
      tweet.entities.hashtags.length <= 4
    ) {
      for (const t in tweet.entities.hashtags) {
        tweet.entities.hashtags.map((val: { text: any }) =>
          hashtagsOfCurrentTweet.push(`#${val.text}`)
        );
      }

      if (!blackListedAccounts.includes(tweet.user.screen_name)) {
        if (_.intersection(interests, hashtagsOfCurrentTweet).length) {
          id = tweet.id_str;
        } else {
          let tweetTextArr: string[] = tweetText.split(' ');
          tweetTextArr = tweetTextArr.map((word: string) => {
            return word.toLowerCase();
          });

          if (!_.intersection(tweetTextArr, blackListedWords).length) {
            id = _.intersection(interests, tweetTextArr).length
              ? tweet.id_str
              : 0;
          }
        }
      }

      if (id) {
        if (!isEnvRestricted()) {
          T.post('statuses/retweet/:id', { id: id.toString() }, () => {
            const query =
              'INSERT INTO `tweets` (tweet_id, tweet_text, user_name, user_id, created_at) VALUES (?, ?, ?, ?, ?)';

            T.post('/favorites/create', { id: id.toString() }, () => {
              connection.query(
                query,
                [
                  tweet.id_str,
                  Object.prototype.hasOwnProperty.call(tweet, 'extended_tweet')
                    ? tweet.extended_tweet.full_text
                    : tweet.text,
                  tweet.user.screen_name,
                  tweet.user.id,
                  tweet.created_at,
                ],
                (err: MysqlError) => {
                  if (err) {
                    console.log(err);
                  }
                }
              );
            });
          });
        } else {
          console.log(
            "A tweet has been captured but it won't be retweeted because by " +
              ' default the bot is forbidden to retweet on development/' +
              'staging environments. To change this behavior set' +
              ' `RESTRICTED_DEV` to true in .env file.'
          );
        }
      }
    }
  }
});

stream.on('error', (err: any) => {
  console.log(err);
});
