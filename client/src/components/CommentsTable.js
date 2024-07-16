import React, { useEffect, useState } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import PropTypes from 'prop-types';
import CommentRow from './CommentRow';
import CommentFormPopup from './CommentFormPopup';
import { GET_COMMENTS } from '../graphql/queries';
import { COMMENTS_SUBSCRIPTION } from '../graphql/subscriptions';
import { CommentSortBy, SortOrderPage } from '../constansts';
import { v4 as uuidv4 } from 'uuid';
function CommentsTable({ initialSortBy, initialSortOrder, initialPage, limit }) {
    const [sortBy, setSortBy] = useState(initialSortBy);
    const [sortOrder, setSortOrder] = useState(initialSortOrder);
    const [showPopup, setShowPopup] = useState(false);
    const [commentId, setCommentId] = useState(null);
    const [comments, setComments] = useState([]);
    const [currentPage, setCurrentPage] = useState(initialPage);

    const { loading, error, data, refetch } = useQuery(GET_COMMENTS, {
        variables: { sortBy: CommentSortBy.CREATED_AT, sortOrder, page: initialPage, limit },
    });

    const { data: subscriptionData } = useSubscription(COMMENTS_SUBSCRIPTION);

    useEffect(() => {
        if (data && data.comments) {
            // Helper function to flatten comments and replace parent.id with parentId
            const flattenComments = (comments) => {
                return comments.reduce((acc, comment) => {
                    // Clone the comment object to avoid mutating the original data
                    const flattenedComment = { ...comment };

                    // Replace parent.id with parentId if parent.id exists
                    if (flattenedComment.parent && flattenedComment.parent.id) {
                        flattenedComment.parentId = flattenedComment.parent.id;
                        delete flattenedComment.parent; // Remove parent.id after assigning parentId
                    }

                    acc.push(flattenedComment);

                    // Recursively flatten children comments
                    if (flattenedComment.children && flattenedComment.children.length > 0) {
                        acc.push(...flattenComments(flattenedComment.children));
                    }

                    return acc;
                }, []);
            };

            const flattenedComments = flattenComments(data.comments);
            setComments(flattenedComments);
        }
    }, [data, setComments]);
    useEffect(() => {
        if (subscriptionData && subscriptionData.newComments) {
            const newComments = subscriptionData.newComments;

            setComments(prevComments => {
                const merge = mergeNewComments(prevComments, newComments);
                return merge;
            });
        }
    }, [subscriptionData]);

    const mergeNewComments = (prevComments, newComments) => {
        const addCommentRecursively = (commentList, newComment) => {
            return commentList.map((comment) => {
                if (comment.id === newComment.parentId) {
                    return {
                        ...comment,
                        children: [newComment,...(comment.children || [])],
                    };
                } else if (comment.children) {
                    return {
                        ...comment,
                        children: addCommentRecursively(comment.children, newComment),
                    };
                }
                return comment;
            });
        };

        const insertCommentByUsernameOrEmail = (commentList, newComment, sortBy) => {
            const propertyName = sortBy === CommentSortBy.USERNAME ? 'username' : 'email';
            const isInsertionNeeded = sortOrder === SortOrderPage.DESC
                ? (commentList.length > 0 && commentList[commentList.length - 1][propertyName] > newComment[propertyName] && commentList[0][propertyName] < newComment[propertyName])
                : (commentList.length > 0 && commentList[commentList.length - 1][propertyName] < newComment[propertyName] && commentList[0][propertyName] > newComment[propertyName]);

            if (commentList.length === 0 || isInsertionNeeded) {
                if (commentList.length < limit) {
                    const insertAtIndex = commentList.findIndex(comment =>
                        sortOrder === SortOrderPage.DESC ? newComment[propertyName] > comment[propertyName] : newComment[propertyName] < comment[propertyName]
                    );
                    if (insertAtIndex === -1) {
                        return sortOrder === SortOrderPage.DESC
                            ? [...commentList, { ...newComment, children: [] }]
                            : [{ ...newComment, children: [] }, ...commentList];
                    } else {
                        commentList.splice(insertAtIndex, 0, { ...newComment, children: [] });
                    }
                }
            }
            return commentList;
        };

        newComments.forEach(newComment => {
            if (!newComment.parentId) {
                if (sortBy === CommentSortBy.CREATED_AT) {
                    if (prevComments.length < limit && Math.max(...prevComments.map(c => c.id), 0) < newComment.id) {
                        prevComments = sortOrder === SortOrderPage.DESC
                            ? [{ ...newComment, children: [] }, ...prevComments]
                            : [...prevComments, { ...newComment, children: [] }];
                    }
                } else if (sortBy === CommentSortBy.USERNAME || sortBy === CommentSortBy.EMAIL) {
                    prevComments = insertCommentByUsernameOrEmail(prevComments, newComment, sortBy);
                }
            } else {
                prevComments = prevComments.map(comment => addCommentRecursively([comment], newComment)[0]);
            }
        });

        return prevComments;
    };

    if (loading) return <p>Loading...</p>;
    if (error) {
        return <p>Error: {error.message}</p>;
    }

    const handleSort = (field) => {
        const newSortOrder = sortBy === field && sortOrder === SortOrderPage.ASC
            ? SortOrderPage.DESC
            : SortOrderPage.ASC;
        setSortBy(field);
        setSortOrder(newSortOrder);
        refetch({ sortBy: field, sortOrder: newSortOrder, page: currentPage, limit });
    };


    const headerClass = (field) => {
        return sortBy === field ? `active ${sortOrder.toLowerCase()}` : '';
    };


    const handlePreviousPage = () => {
        if (currentPage > 1) {
            const newPage = currentPage - 1;
            setCurrentPage(newPage);
            refetch({ sortBy, sortOrder, page: newPage, limit });
        }
    };

    const handleNextPage = () => {
        const newPage = currentPage + 1;
        setCurrentPage(newPage);
        refetch({ sortBy, sortOrder, page: newPage, limit });
    };

    return (
        <div className='container'>
            <button onClick={() => {
                setShowPopup(true);
                setCommentId(null); // For new root comments
            }}>
                Create Comment
            </button>
            {comments.length > 0 ? (
                <>
                    <div className='wrapper'>
                        <table>
                            <thead>
                            <tr>
                                <th
                                    onClick={() => handleSort(CommentSortBy.USERNAME)}
                                    className={`header-default ${headerClass(CommentSortBy.USERNAME)}`}
                                >
                                    User Name {sortBy === CommentSortBy.USERNAME && (
                                    sortOrder === SortOrderPage.ASC ? <span className='up-arrow'></span> :
                                        <span className='down-arrow'></span>
                                )}
                                </th>
                                <th
                                    onClick={() => handleSort(CommentSortBy.EMAIL)}
                                    className={`header-default ${headerClass(CommentSortBy.EMAIL)}`}>
                                    Email {sortBy === CommentSortBy.EMAIL && (
                                    sortOrder === SortOrderPage.ASC ? <span className='up-arrow'></span> :
                                        <span className='down-arrow'></span>
                                )}
                                </th>
                                <th colSpan={4}
                                    onClick={() => handleSort(CommentSortBy.CREATED_AT)}
                                    className={headerClass(CommentSortBy.CREATED_AT)}
                                >
                                    Published Date {sortBy === CommentSortBy.CREATED_AT && (
                                    sortOrder === SortOrderPage.ASC ? <span className='up-arrow'></span> :
                                        <span className='down-arrow'></span>
                                )}
                                </th>
                            </tr>
                            </thead>
                            <tbody className='root_tbody'>
                            {comments.map((comment) => (
                                <CommentRow
                                    key={uuidv4()}
                                    comment={comment}
                                    level={0}
                                    setShowPopup={setShowPopup}
                                    setCommentId={setCommentId}
                                />
                            ))}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <button onClick={handlePreviousPage} disabled={currentPage <= 1}>
                            Previous
                        </button>
                        <button onClick={handleNextPage} disabled={comments.length < limit}>
                            Next
                        </button>
                    </div>
                </>
            ) : (
                <>
                <p>No comments found.</p>
                <div>
                <button onClick={handlePreviousPage} disabled={currentPage <= 1}>
                    Previous
                </button>
                </div>
                </>
    )
}

{
    showPopup && (
        <div className='modal'>
            <CommentFormPopup onClose={() => setShowPopup(false)} parentId={commentId} />
                </div>

            )}
        </div>
    );
}

CommentsTable.propTypes = {
    initialSortBy: PropTypes.string.isRequired,
    initialSortOrder: PropTypes.oneOf(['ASC', 'DESC']).isRequired,
    initialPage: PropTypes.number.isRequired,
    limit: PropTypes.number.isRequired,
};

export default CommentsTable;
