# Programmer Farsi Twitter Bot 

[![Follow on Twitter](http://img.shields.io/twitter/follow/programmer_fa.svg?label=follow+@programmer_fa)](https://twitter.com/programmer_fa)

<p></p>

A simple bot that brings Persian tweets about programming to your feed.

### Requirements to run the bot

1. A developer account (Grab one from here [Twitter](https://developer.twitter.com/)) 
2. pm2 module (run `npm i -g pm2`)
3. Node.js and npm

### Project setup

0. **Clone this repo:**\
Run `https://github.com/amirhoseinsalimi/programmer-fa`

1. **Install dependencies:**\
Run `npm i`

2. **Create an .env file**\
Copy the content of `.env.example` into `.env` and fill it with your credentials

3. **Run migrations**\
Run the command `knex migrate:latest` to create the tables

4. **Run the bot**\
For development with hot reload: `npm run bot:dev`\
For Run `npm start`
 ---
### To-do list before we hit version 1.0.0
* [ ] Enhance code modularity
* [ ] Separate Development & Debug env. variables
* [ ] Let "log verbosity level" and "file storing" to be set
* [x] Don't store or log `RT @username`
* [ ] Log the details of retweets in dev. env. (Name, date, text, matched words, link, etc.)
* [ ] Full implementation of the database
* [ ] Migrate to Twitter API v2


<br />
<small>A small side project done in https://expteam.ir</small>
