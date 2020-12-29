import * as express from 'express';
import * as fs from 'fs';

const router = express.Router();

const tweets = {
  tweets: fs.readFileSync(`${__dirname}/tweets.json`, 'utf8'),
};

router.get('/tweets', async (req, res) => {
  res.json(tweets);
});

export default router;
