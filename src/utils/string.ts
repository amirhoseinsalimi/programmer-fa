import { isTweetExtended } from './tweet';

const suspiciousWords: string[] = require('../data/words-with-suspicion.json');

export const makeHashtag = (string: string): string => {
  let s: string;

  s = string.replace(/[ ‌\-.]/gim, '_');

  s = s.replace(/_{2,}/, '_');

  s = `#${s}`;

  return s;
};

export const getTweetLength = (tweetText: string): number => tweetText.length;

export const getTweetFullText = (tweet: any): string =>
  // All tweets have a `text` property, but the ones having 140 or more
  // characters have `extended_tweet` property set to `true` and an extra
  // `extended_tweet` property containing the actual tweet's text under
  // `full_text`. For tweets which are not truncated the former `text` is
  // enough.
  (isTweetExtended(tweet) ? tweet.extended_tweet.full_text : tweet.text);

export const removeURLs = (text: string): string => {
  const urlRegex = /((http(s?)?):\/\/)?([wW]{3}\.)?[a-zA-Z0-9\-.]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?/gim;
  let numberOfURLs = (text.match(urlRegex) || []).length;

  let lText: string = text.toLowerCase();

  while (numberOfURLs) {
    lText = lText.replace(urlRegex, '');
    numberOfURLs -= 1;
  }

  return lText.replace(/ +/g, ' ').trim();
};

export const hasURL = (tweet: any): boolean => {
  const urlRegex = /((http(s?)?):\/\/)?([wW]{3}\.)?[a-zA-Z0-9\-.]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?/gim;

  return urlRegex.test(tweet.$tweetText) || tweet.entities?.urls?.length > 0;
};

export const getNumberOfHashtags = (str: string): number => {
  if (str.length === 0) {
    return 0;
  }

  const matches: RegExpMatchArray = str.match(/#\S/gim);

  return matches && matches.length ? matches.length : 0;
};

export const removeRetweetNotation = (tweetText: string): string =>
  tweetText.replace(/(RT @.*?:)/gim, '').trim();

export const hasFiveHashtagsOrMore = (tweet: any): boolean =>
  getNumberOfHashtags(getTweetFullText(tweet)) >= 5 ||
  tweet.entities.hashtags.length >= 5;

export const hasSuspiciousURLs = (tweet: any): boolean => {
  const fileExtensionRegExp = /(\.apsx|\.php|\.html)/;

  return (
    fileExtensionRegExp.test(tweet.$tweetText) ||
    fileExtensionRegExp.test(tweet.$retweetText) ||
    tweet.entities?.urls?.some((urlEntity: string) =>
      fileExtensionRegExp.test(urlEntity),
    )
  );
};

export const removeSuspiciousWords = (text: string): string => {
  let lText: string = text.toLowerCase();

  suspiciousWords.forEach((word: string) => {
    const lWord: string = word.toLowerCase();

    if (text.search(new RegExp(lWord)) > -1) {
      lText = lText.replace(new RegExp(lWord, 'g'), '');
    }
  });

  return lText.replace(/ +/g, ' ');
};
