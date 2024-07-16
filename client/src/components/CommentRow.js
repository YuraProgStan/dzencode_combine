import React, { useState } from "react";
import PropTypes from "prop-types";
import CommentFormPopup from "./CommentFormPopup";
import TextFileViewer from "./TextViewer";
import txtIcon from "../images/txt.png";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
function CommentRow({ comment }) {
    const [showPopup, setShowPopup] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileType, setFileType] = useState(null);

    const openModal = (fileUrl) => {
        setSelectedFile(fileUrl);
        setShowModal(true);
        const extension = fileUrl.split('.').pop().toLowerCase();
        if (extension === 'txt') {
            setFileType('text');
        } else {
            setFileType('image');
        }
    };

    const closeModal = () => {
        setSelectedFile(null);
        setShowModal(false);
        setFileType(null);
    };


    if (!comment || !comment.user) {
        return null;
    }
    const formattedDate = dayjs(comment.createdAt).tz(dayjs.tz.guess()).format('DD.MM HH:mm');

    return (
        <>
            <tr className="header_tr" key={comment.id}>
                <td>{comment.user.username}</td>
                <td>{comment.user.email}</td>
                <td>{formattedDate}</td>
                <td>{comment.user.homepage}</td>
                <td className="column_button_reply">
                    <button onClick={() => setShowPopup(true)}>Reply</button>
                </td>
            </tr>
            <tr>
                <td colSpan={4}>{comment.text}</td>
                <td>
                    {comment.fileUrl && (
                        <>
                            {comment.fileUrl.split('.').pop().toLowerCase() === 'txt' ? (
                                <a href="#" onClick={() => openModal(comment.fileUrl)}>
                                    <img
                                        src={txtIcon}
                                        alt="Text File"
                                        className="comment-file-icon"
                                        style={{ width: "50px", height: "50px" }}
                                    />
                                </a>
                            ) : (
                                <a href="#" onClick={() => openModal(comment.fileUrl)}>
                                    <img
                                        src={comment.fileUrl}
                                        alt="Image"
                                        className="comment-file-image"
                                        style={{ width: "100px" }}
                                    />
                                </a>
                            )}
                        </>
                    )}
                </td>
            </tr>
            {showModal && (
                <div className="modal" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <span className="close" onClick={closeModal}>&times;</span>
                        {fileType === 'text' ? (
                            <TextFileViewer fileUrl={selectedFile} />
                        ) : fileType === 'image' ? (
                            <img src={selectedFile} alt="Original File" className="modal-image" />
                        ) : null}
                    </div>
                </div>
            )}
            {showPopup && (
                <div className="modal">
                    <CommentFormPopup
                        onClose={() => setShowPopup(false)}
                        parentId={comment.id}
                    />
                </div>
            )}
            {comment.children && comment.children.length > 0 &&  comment.children[0].text && comment.children.map((childComment) => (
                <tr key={childComment.id}>
                    <td className="root_td_for_nested" colSpan="6">
                        <table className="nested_table">
                            <tbody>
                            <CommentRow comment={childComment}/>
                            </tbody>
                        </table>
                    </td>
                </tr>
            ))}
        </>
    );
}

CommentRow.propTypes = {
    comment: PropTypes.shape({
        id: PropTypes.number.isRequired,
        parentId: PropTypes.number,
        text: PropTypes.string.isRequired,
        user: PropTypes.shape({
            username: PropTypes.string.isRequired,
            email: PropTypes.string.isRequired,
            homepage: PropTypes.string.isRequired,
        }).isRequired,
        createdAt: PropTypes.string.isRequired,
        fileUrl: PropTypes.string,
        children: PropTypes.arrayOf(PropTypes.object),
    }).isRequired,
};

export default CommentRow;
