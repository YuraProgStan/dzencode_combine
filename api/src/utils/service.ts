import { MAX_FILE_SIZE } from '../constants';

const USERNAME_RULE = /^[a-zA-Z0-9]+$/;
const CAPTCHA_RULE = /^[a-zA-Z0-9_-]+$/;
const HOME_URL_RULE = /^(https?):\/\/[^\s/$.?#].[^\s]*$/;
const TEXT_RULE =
  /^(?:(<(a|code|i|strong)(\s+[^>]*|)>[\s\S]*?<\/\2>)|([^<]+))*$/;
const ALLOWED_FILE_EXTENSIONS = /jpg|jpeg|gif|png|txt/;

export const REGEX = {
  USERNAME_RULE,
  CAPTCHA_RULE,
  HOME_URL_RULE,
  TEXT_RULE,
  ALLOWED_FILE_EXTENSIONS,
};
export const USERNAME_RULE_MESSAGE =
  'Username should have only numbers and letters of the Latin alphabet.';
const HOME_URL_RULE_MESSAGE = 'Home url should be a valid http or https url.';
const TEXT_RULE_MESSAGE =
  'In text allowed only <a>, <code>, <i>, <strong> html tags.';
const FILE_EXTENSION_RULE_MESSAGE =
  'allowed extension only: jpg, jpeg, gif, png, txt';
const FILE_SIZE_TEXT_RULE_MESSAGE =
  'File size for txt can\'t be greter then 100 KB';

const CAPTCHA_RULE_MESSAGE = 'Captcha is not valid.';
export const MAX_TXT_FILE_SIZE = MAX_FILE_SIZE;

export const MESSAGES = {
  USERNAME_RULE_MESSAGE,
  HOME_URL_RULE_MESSAGE,
  TEXT_RULE_MESSAGE,
  FILE_EXTENSION_RULE_MESSAGE,
  FILE_SIZE_TEXT_RULE_MESSAGE,
  CAPTCHA_RULE_MESSAGE,
};

export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
