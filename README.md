# Programmer Farsi Twitter Bot 

<a href="https://twitter.com/intent/follow?screen_name=programmer_fa">
  <img src="https://img.shields.io/twitter/follow/programmer_fa?style=social&logo=twitter"
    alt="follow on Twitter">
</a>

<p></p>

A simple bot that brings tweets about programming to your feed.

### Requirements to run the bot

1. A developer account (Grab one from here [Twitter](https://developer.twitter.com/)) 
2. pm2 module (run `npm i -g pm2`)
3. Node.js and npm

### Project setup

0. **Clone this repo:**\
Run `https://github.com/amirhoseinsalimi/programmer-fa`

1. **Install dependencies:**
Run `npm i`

2. **Create an .env file**
Copy the content of `.env.example` into `.env` and fill it with your credentials

3. **Run migrations**
Run the command `knex migrate:latest` to create the tables

4. 3. **Run the bot**\
For development with hot reload: `npm run bot:dev`
For Run `npm start`
 ---
If you want to report a bug or willing a new feature feel free to open a issue. PRs are welcome!
