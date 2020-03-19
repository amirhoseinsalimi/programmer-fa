/**
 * Whether a tweet is under 140 characters long or not
 * @param tweet object
 * @return boolean
 */
export function isTweetExtended(tweet: any): boolean {
  return tweet.truncated === true;
}

/**
 * Whether a tweet is in Farsi or not.
 * This behaviour relies on Twitter API.
 * @param tweet
 * @return boolean
 */
export function isTweetFarsi(tweet: any): boolean {
  return tweet.lang === 'fa';
}

/**
 *
 * @param tweet
 * @return boolean
 */
export function isTweetNotAReply(tweet: any): boolean {
  // Polyfill to check whether a tweet is a reply or not
  return !tweet.in_reply_to_status_id && !tweet.in_reply_to_user_id;
}

/**
 *
 * @param tweet
 * @return string
 */
export function getTweetFullText(tweet: any): string {
  // All tweets have a `text` property, but the ones having 140 or more
  // characters have `extended_tweet` property set to `true` and an extra
  // `extended_tweet` property containing the actual tweet's text under
  // `full_text`. For tweets which are not truncated the former `text` is
  // enough.
  return isTweetExtended(tweet) ? tweet.extended_tweet.full_text : tweet.text;
}

/**
 *
 * @param tweet
 * @return string[]
 */
export function getTweetHashtags(tweet: any): string[] {
  return tweet.enteties.hashtags;
}
