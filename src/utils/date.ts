import envs from '../env';
import { DateTime, Duration } from 'luxon';

export const getDiffBetweenDateTimeAndNowInDays = (date: DateTime): Duration => DateTime.now().diff(date, 'days');

export const parseTwitterDateToLuxon = (date: string): DateTime => DateTime.fromFormat(date, 'ccc LLL dd HH:mm:ss ZZZ yyyy');

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
