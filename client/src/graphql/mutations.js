import { gql } from '@apollo/client';
//   // $captcha: String!,
// captcha: $captcha,

export const SIGN_UP = gql`
  mutation SignUp($username: String!, $email: String!, $password: String!) {
    signUp(createUserInput: {
      username: $username,
      email: $email,
      password: $password,
    }) {
      id
      username
    }
  }
`;
export const SIGN_IN = gql`
  mutation SignIn($email: String!, $password: String!) {
    signIn(signInInput: {
      email: $email,
      password: $password
    }) {
      access_token
    }
  }
`;
export const POST_COMMENT = gql`
  mutation PostComment($input: PostCommentInput!) {
    postComment(input: $input) {
      success
      message
    }
  }
`;
