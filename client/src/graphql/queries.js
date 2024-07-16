import { gql } from "@apollo/client";
export const GET_COMMENTS = gql`
  query GetComments($limit: Int = 25, $page: Int = 1, $sortBy: CommentSortBy = CREATED_AT, $sortOrder: String = "DESC") {
    comments(limit: $limit, page: $page, sortBy: $sortBy, sortOrder: $sortOrder) {
      id
      user {
        username
        email
        homepage
      }
      text
      fileUrl
      createdAt
      parent{
       id
      }
      children {
        id
        user {
          username
          email
          homepage
        }
        text
        fileUrl
        createdAt
        children {
        id
        }
      }
    }
  }
`;
