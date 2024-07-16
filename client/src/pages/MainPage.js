
import React from 'react';
import CommentsTable from '../components/CommentsTable';
import { CommentSortBy, SortOrderPage } from '../constansts';
const MainPage = () => {
    const itemPerPage = 25;

    return (
        <div>
            <CommentsTable
                initialSortBy={CommentSortBy.CREATED_AT}
                initialSortOrder={SortOrderPage.DESC}
                initialPage={1}
                limit={itemPerPage}
            />
        </div>
    );
};

export default MainPage;
