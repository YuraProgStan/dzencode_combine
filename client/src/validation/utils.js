const USERNAME_RULE = /^[a-zA-Z0-9]+$/;
const HOME_URL_RULE = /^(https?):\/\/[^\s/$.?#].[^\s]*$/;

const PASSWORD_RULE = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
const TEXT_RULE = /^(?:(<(a|code|i|strong)(\s+[^>]*|)>.*?<\/\2>)|([^<]+))$/;
const ALLOWED_FILE_EXTENSIONS = /jpg|jpeg|gif|png|txt/;
const EMAIL_RULE = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
const CAPTCHA_RULE = /^[a-zA-Z0-9_-]+$/;
export const REGEX = {
    USERNAME_RULE,
    HOME_URL_RULE,
    PASSWORD_RULE,
    TEXT_RULE,
    ALLOWED_FILE_EXTENSIONS,
    EMAIL_RULE,
    CAPTCHA_RULE
}
export const MESSAGES = {
    USERNAME_RULE_MESSAGE: 'Username should have only numbers and letters of the Latin alphabet.',
    HOME_URL_RULE_MESSAGE: 'Home URL should be a valid HTTP or HTTPS URL.',
    TEXT_RULE_MESSAGE: 'Only <a>, <code>, <i>, <strong> HTML tags are allowed in text.',
    FILE_EXTENSION_RULE_MESSAGE: 'Allowed file extensions are: jpg, jpeg, gif, png, txt.',
    FILE_SIZE_TEXT_RULE_MESSAGE: 'File size for txt can\'t be greater than 100 KB.',
    EMAIL_RULE_MESSAGE: 'Invalid email format.',
    PASSWORD_RULE_MESSAGE:
        'Password should have 1 upper case, lowcase letter along with a number and special character.',
    CAPTCHA_RULE_MESSAGE: 'Captcha is not valid.',
};

export const MAX_TXT_FILE_SIZE = 1024 * 100; // 100 KB
