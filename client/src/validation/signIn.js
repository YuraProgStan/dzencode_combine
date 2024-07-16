import { REGEX, MESSAGES } from "./utils";

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
            throw new Error(MESSAGES.EMAIL_RULE_MESSAGE);
        }



        // Additional validation for other fields like captcha if needed

        return true;
    }
}

export default SignInInput;
