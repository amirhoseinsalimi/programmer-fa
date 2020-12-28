import * as Twit from 'twit';

import envs from '../../env';

const T: Twit = new Twit({
  consumer_key: envs.CONSUMER_KEY,
  consumer_secret: envs.CONSUMER_SECRET,
  access_token: envs.ACCESS_TOKEN,
  access_token_secret: envs.ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000,
  strictSSL: envs.STRICT_SSL !== 'false',
});

export { T, Twit };
