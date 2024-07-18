import { REGEX, MESSAGES } from './utils';

class CreateUserInput {
    constructor({
                    username,
                    email,
                    password
    } ) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    validate() {
        if (!this.username.match(REGEX.USERNAME_RULE)) {
            throw new Error(MESSAGES.USERNAME_RULE_MESSAGE);
        }

        if (!this.email.match(REGEX.EMAIL_RULE)) {
            throw new Error(MESSAGES.EMAIL_RULE_MESSAGE);
        }

        if (!this.password.match(REGEX.PASSWORD_RULE)) {
            throw new Error(MESSAGES.PASSWORD_RULE_MESSAGE);
        }



        // Additional validation for other fields like captcha if needed

        return true;
    }
}

export default CreateUserInput;
