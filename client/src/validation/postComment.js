import { MAX_TXT_FILE_SIZE, MESSAGES, REGEX } from './utils';

class PostCommentInput {
    constructor({
                    username,
                    email,
                    homepage,
                    captcha,
                    text,
                    file,
                    parentId
    } ) {
        this.username = username;
        this.email = email;
        this.homepage = homepage;
        this.captcha = captcha;
        this.text = text;
        this.file = file;
        this.parentId = parentId;
    }

    validate() {
        if (!this.captcha.match(REGEX.CAPTCHA_RULE)) {
            throw new Error(MESSAGES.CAPTCHA_RULE_MESSAGE);
        }
        if (!this.username.match(REGEX.USERNAME_RULE)) {
            throw new Error(MESSAGES.USERNAME_RULE_MESSAGE);
        }

        if (!this.email.match(REGEX.EMAIL_RULE)) {
            throw new Error(MESSAGES.EMAIL_RULE_MESSAGE);
        }

        if (this.homepage && !this.homepage.match(REGEX.HOME_URL_RULE)) {
            throw new Error(MESSAGES.HOME_URL_RULE_MESSAGE);
        }


        if (!this.text.match(REGEX.TEXT_RULE)) {
            throw new Error(MESSAGES.TEXT_RULE_MESSAGE);
        }

        if (this.file) {
            const fileExtension = this.file.name.split('.').pop();
            if (!fileExtension.match(REGEX.ALLOWED_FILE_EXTENSIONS)) {
                throw new Error(MESSAGES.FILE_EXTENSION_RULE_MESSAGE);
            }
            if (fileExtension.toLowerCase() === 'txt' && this.file.size > MAX_TXT_FILE_SIZE) {
                throw new Error(MESSAGES.FILE_SIZE_TEXT_RULE_MESSAGE);
            }
        }
        return true;
    }
}

export default PostCommentInput;
