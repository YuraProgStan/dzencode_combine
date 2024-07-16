import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const TextFileViewer = ({ fileUrl } ) => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(fileUrl)
            .then(response => response.text())
            .then(data => {
                setText(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err);
                setLoading(false);
            });
    }, [fileUrl]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error loading file: {error.message}</div>;

    return (
        <div className='txt_viewer'>
            <h1>Text File Contents</h1>
            <pre>{text}</pre>
        </div>
    );
};

TextFileViewer.propTypes = {
    fileUrl: PropTypes.string.isRequired,
};
export default TextFileViewer;
