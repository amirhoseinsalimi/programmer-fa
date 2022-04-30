import type {I18nKeys} from '../types/general';
import * as en from '../translations/en.json';

const templateMatcher = /{{\s?([^{}\s]*)\s?}}/g;

export const t = (key: I18nKeys, args?: Record<string, unknown>) => {
  return en[key].replace(templateMatcher, (substring, value) => {
    value = args[value];
    return value;
  });
};
