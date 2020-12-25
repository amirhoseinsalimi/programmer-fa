const express = require('express');
const fs = require('fs');

const router = express.Router();

const tweets = {
  tweets: fs.readFileSync(`${__dirname}/tweets.json`, 'utf8'),
};

router.get('/tweets', async (req, res) => {
  res.json(tweets);
});

module.exports = router;
