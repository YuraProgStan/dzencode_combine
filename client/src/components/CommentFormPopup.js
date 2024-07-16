import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { POST_COMMENT } from '../graphql/mutations';
import PropTypes from 'prop-types';
import PostCommentInput from '../validation/postComment';
import ReCAPTCHA from 'react-google-recaptcha';
const recaptchaKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

function CommentFormPopup({ onClose, parentId = null }) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [homepage, setHomepage] = useState("");
    const [captcha, setCaptcha] = useState(null);
    const [text, setText] = useState("");
    const [file, setFile] = useState(null);
    const [validationError, setValidationError] = useState(null);

    const [postComment, { loading, }] = useMutation(POST_COMMENT, {
        onCompleted: (data) => {
            if (data.postComment.success) {
                onClose();
            }
        },
        onError: (error) => {
            setValidationError(error.message); // Set validation error message from server
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const commentInput = new PostCommentInput({
            username,
            email,
            homepage,
            captcha,
            text,
            file,
            parentId
        });
        try {
            commentInput.validate();
            const filteredHomepage = homepage !== '' ? homepage: null;
            postComment({
                variables: {
                    input: {
                        username: username,
                        email,
                        ...(parentId && { parentId }),
                        ...(filteredHomepage && { homepage:  filteredHomepage }),
                        captcha,
                        text,
                        file: file || null,
                    },
                },
            });
        }catch (err) {
            setValidationError(err.message);
        }
    }

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
    };

    const handleCaptchaChange = (value) => {
        setCaptcha(value);
    }
    return (
        <div className="popup">
            <h2>Create Post</h2>
            <span className="close" onClick={onClose}>&times;</span>
            <form onSubmit={handleSubmit}>
                {validationError && <p className="p_error" >{validationError}</p>}
                <label>Username:</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="popup-input"
                />
                <label>Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="popup-input"
                />
                <label>Homepage:</label>
                <input
                    type="text"
                    value={homepage}
                    onChange={(e) => setHomepage(e.target.value)}
                    className="popup-input"
                />
                <label>Text:</label>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    required
                    className="popup-input"
                />
                <label>File:</label>
                <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*, .jpg, .gif, .png, .txt"
                    className="popup-input"
                />
                <button type="submit" disabled={loading} className="popup-button">
                    {loading ? "Posting..." : "Post Comment"}
                </button>
                <ReCAPTCHA
                    sitekey={recaptchaKey}
                    onChange={handleCaptchaChange} // Handle reCAPTCHA token
                />
            </form>
        </div>
    );
}

CommentFormPopup.propTypes = {
    onClose: PropTypes.func.isRequired,
    parentId: PropTypes.number,
};

export default CommentFormPopup;
