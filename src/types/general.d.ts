import en from '../translations/en.json';

export type I18nKeys = keyof typeof en;

export interface Message {
  message: string;
}
