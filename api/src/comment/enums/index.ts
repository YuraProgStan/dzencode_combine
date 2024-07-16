import { registerEnumType } from '@nestjs/graphql';

export enum CommentSortBy {
  USERNAME = 'username',
  EMAIL = 'email',
  CREATED_AT = 'createdAt',
}

registerEnumType(CommentSortBy, {
  name: 'CommentSortBy',
  description: 'Comment Types',
});
