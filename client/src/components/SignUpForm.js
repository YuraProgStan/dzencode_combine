import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { SIGN_UP } from '../graphql/mutations';
import { useNavigate } from "react-router-dom";
import CreateUserInput from "../validation/signUp";

const SignUpForm = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [validationError, setValidationError] = useState('');
    const navigate = useNavigate();

    const [signUp] = useMutation(SIGN_UP, {
        onCompleted: (data) => {
            if (data.signUp && data.signUp.id && data.signUp.username) {
                navigate("/signin");
            }
        },
        onError: (error) => {
            console.error('Error signing up:', error);
            setValidationError(error.message);
        }
    });

    const handleSubmit = async (event) => {
        event.preventDefault();
        const createUserInput = new CreateUserInput({
            username,
            email,
            password
        });

        try {
            createUserInput.validate();
            await signUp({
                variables: {
                        username,
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
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                {validationError && <p className="p_error" >{validationError}</p>}
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="popup-input"
                    />
                </div>
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
                <button type="submit" className="popup-button">Sign Up</button>
            </form>
        </div>
   );
};

export default SignUpForm;
