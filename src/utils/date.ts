import envs from '../env';
import { DateTime, Duration } from 'luxon';

/**
 * Return the difference between the given {DateTime}
 * @param {DateTime} date - The date
 * @return {Duration}
 */
export const getDiffBetweenDateTimeAndNowInDays = (date: DateTime): Duration => DateTime.now().diff(date, 'days');

/**
 * Parse the date format returned from Twitter API to Luxon DateTime
 * @param {string} date - The date
 * @return {DateTime}
 */
export const parseTwitterDateToLuxon = (date: string): DateTime => DateTime.fromFormat(date, 'ccc LLL dd HH:mm:ss ZZZ yyyy');

/**
 * Check if the user has registered recently or not
 * @param {*} tweet
 * @return {boolean}
 */
export const hasUserRegisteredRecently = (tweet: any): boolean => {
  const originalUser: any = tweet.user;
  const retweeterUser: any = tweet.retweeted_status;

  const originalUserRegisterDate: DateTime = parseTwitterDateToLuxon(
    originalUser.created_at,
  );

  let retweeterUserRegisterDateDiff: number;

  const dayToBlockNewUsers: number = +envs.IGNORE_USERS_NEWER_THAN;

  const originalUserRegisterDateDiff = getDiffBetweenDateTimeAndNowInDays(
    originalUserRegisterDate,
  ).days;

  if (retweeterUser) {
    const retweeterUserRegisterDate: DateTime = parseTwitterDateToLuxon(
      tweet.retweeted_status.user.created_at,
    );

    retweeterUserRegisterDateDiff = getDiffBetweenDateTimeAndNowInDays(
      retweeterUserRegisterDate,
    ).days;
  }

  return (
    dayToBlockNewUsers > originalUserRegisterDateDiff
    || dayToBlockNewUsers > retweeterUserRegisterDateDiff
  );
};
