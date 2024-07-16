import React, { useState } from 'react';
import { useMutation } from "@apollo/client";
import { SIGN_IN } from "../graphql/mutations";
import { useNavigate } from "react-router-dom";
import SignInInput from "../validation/signIn";

const SignInForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [validationError, setValidationError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [signIn] = useMutation(SIGN_IN, {
        onCompleted: (data) => {
            if (data.signIn.access_token) {
                localStorage.setItem('token', data.signIn.access_token);
                navigate("/");
            }
        },
        onError: (error) => {
            console.error('Error signing in:', error);
            setValidationError(error.message);
        }
    });

    const handleSubmit = async (event) => {
        event.preventDefault();
        const signInInput = new SignInInput({
            email,
            password
        });

        try {
            signInInput.validate();
            await signIn({
                variables: {
                        email,
                        password,
                },
            });
        } catch (err) {
            // Handle validation errors
            setValidationError(err.message);
        }
    };

    return (
        <div className="popup-container">
            <h2>Sign In</h2>
            <form onSubmit={handleSubmit}>
                {validationError && <p className="p_error" >{validationError}</p>}
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="popup-input"
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <div className="password-container">
                        <input
                            type={showPassword ? "text" : "password"} // Toggle input type
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="popup-input"
                        />
                    </div>
                    <label>
                        <input
                            type="checkbox"
                            checked={showPassword}
                            onChange={() => setShowPassword(!showPassword)}
                        />
                        Show Password
                    </label>
                </div>
                <button type="submit" className="popup-button">Sign In</button>
            </form>
        </div>
    );
};

export default SignInForm;
