/*=======================================
 *            Node.js Modules
 * ====================================*/
import * as Twit from 'twit';
import * as _ from 'lodash';
import * as mysql from 'mysql';
import './env';

/*=======================================
 *            Configuration
 * ====================================*/
const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
});

const T: Twit = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000,
  strictSSL: !!process.env.STRICT_SSL,
});

/*=======================================
 *                Export
 * ====================================*/
export { T, connection };

/*=======================================
 *         My Modules and Utils
 * ====================================*/
import { logInfo, logWarning, logError, logSuccess } from './logger';
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
  retweet,
  favourite,
  store,
} from './utils';

/*=======================================
 *                 Bot
 * ====================================*/
const interests: string[] = [];

// Include hashtags in a single array
hashtagsToFollow.map((val: string) => interests.push(val.toLowerCase()));
wordsToFollow.map((val: string) => interests.push(val.toLowerCase()));

const params: Twit.Params = {
  // track these words
  track: interests,
};

const stream = T.stream('statuses/filter', params);

stream.on('tweet', (tweet) => {
  if (isTweetFarsi(tweet) && isTweetNotAReply(tweet)) {
    const hashtagsOfCurrentTweet: string[] = [];

    const tweetText: string = getTweetFullText(tweet);

    if (
      getAllOccurrences('#', tweetText, true).length <= 4 &&
      tweet.entities.hashtags.length <= 4
    ) {
      for (const t in tweet.entities.hashtags) {
        tweet.entities.hashtags.map((val: { text: any }) =>
          hashtagsOfCurrentTweet.push(`#${val.text}`)
        );
      }

      let id: number = 0;

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
          retweet(id)
            .then(({ message }) => {
              logSuccess(message);

              favourite(id)
                .then(({ message }) => {
                  logSuccess(message);
                })
                .catch((err) => {
                  logError(err);
                });
            })
            .catch((err) => {
              logError(err);
            });
        } else {
          logWarning(
            "A tweet has been captured but it won't be retweeted because by " +
              ' default the bot is forbidden to retweet from a development/' +
              'staging environment. To change this behavior set' +
              ' `RESTRICTED_DEV` to false in .env file.'
          );
          logInfo(tweetText);
        }

        store(tweet)
          .then(({ message }) => {
            logSuccess(message);
          })
          .catch((err) => {
            logError(err);
          });
      }
    }
  }
});

stream.on('error', (err: any) => {
  logError(err);
});
