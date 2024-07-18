import { REGEX, MESSAGES } from './utils';

class SignInInput {
    constructor({
                    email,
                    password
    } ) {
        this.email = email;
        this.password = password;
    }

    validate() {
        if (!this.email.match(REGEX.EMAIL_RULE)) {
            throw new Error(MESSAGES.EMAIL_RULE_MESSAGE);
        }

        if (!this.password.match(REGEX.PASSWORD_RULE)) {
            throw new Error(MESSAGES.PASSWORD_RULE_MESSAGE);
        }

        return true;
    }
}

export default SignInInput;
