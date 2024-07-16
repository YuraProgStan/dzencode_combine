import { gql } from '@apollo/client';

export const COMMENTS_SUBSCRIPTION = gql`
  subscription {
    newComments {
      id
      text
      fileUrl
      parentId
      createdAt
      user {
        username
        email
        homepage
      }
    }
  }
`;
