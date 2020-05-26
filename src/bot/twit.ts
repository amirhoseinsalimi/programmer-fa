import * as Twit from 'twit';

const {
  CONSUMER_KEY: consumer_key,
  CONSUMER_SECRET: consumer_secret,
  ACCESS_TOKEN: access_token,
  ACCESS_TOKEN_SECRET: access_token_secret,
  STRICT_SSL: strictSSL,
} = require('../../env');

const T: Twit = new Twit({
  consumer_key,
  consumer_secret,
  access_token,
  access_token_secret,
  timeout_ms: 60 * 1000,
  strictSSL: !!strictSSL,
});

export { T, Twit };
