# Programmer Farsi Twitter Bot

[![Follow on Twitter](http://img.shields.io/twitter/follow/programmer_fa.svg?label=follow+@programmer_fa)](https://twitter.com/programmer_fa)

<p></p>

A Twitter bot that brings Persian tweets about programming to your feed.
Feel free to add your desired words and open a PR.

### Requirements to run the bot

1. A developer account (Grab one from here [Twitter](https://developer.twitter.com/))
2. pm2 module (run `npm i -g pm2`)
3. Node.js and npm

### Project setup

0. **Clone this repo:**\
   Run `git clone https://github.com/amirhoseinsalimi/programmer-fa`

1. **Install dependencies:**\
   Run `npm i`

1. **Create an .env file**\
   Copy the content of `.env.example` into `.env` and fill it with your credentials

1. **Run migrations**\
   Run the command `npm run migrate:latest` to create the tables

1. **Run the bot**\
   For development with hot reload: `npm run dev`\
   For Run `npm start`

### Project setup (Docker)

0. **Clone this repo:**\
   Run `git clone https://github.com/amirhoseinsalimi/programmer-fa`

1. **Create an .env file**\
   Copy the content of `.env.example` into `.env` and fill it with your credentials

1. **Run the bot**\
   `docker-compose up --build -d`
