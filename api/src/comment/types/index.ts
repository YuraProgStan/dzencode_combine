import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ResponseComment {
  @Field(() => String)
  message: string;

  @Field(() => Boolean)
  success: boolean;
}

@ObjectType()
export class Message {
  @Field(() => Int)
  userId: number;

  @Field()
  text: string;

  @Field({ nullable: true })
  parentId?: number;

  @Field({ nullable: true })
  homepage?: string;

  @Field({ nullable: true })
  fileUrl?: string;
}

@ObjectType()
export class UserResponse {
  @Field()
  username: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  homepage?: string;
}

@ObjectType()
export class ParentResponse {
  @Field(() => Int)
  id: number;
}

@ObjectType()
export class CommentsPaginationResponse {
  @Field(() => Int)
  id: number;

  @Field(() => UserResponse)
  user: UserResponse;

  @Field()
  text: string;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  fileUrl?: string;

  @Field(() => ParentResponse, { nullable: true })
  parent?: ParentResponse;

  @Field(() => [CommentsPaginationResponse], { nullable: true })
  // eslint-disable-next-line no-use-before-define
  children?: CommentsPaginationResponse[] = [];
}

@ObjectType()
export class NewCommentSubscriptionResponse {
  @Field(() => Int)
  id: number;

  @Field(() => UserResponse)
  user: UserResponse;

  @Field()
  text: string;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  fileUrl?: string;

  @Field(() => Int, { nullable: true })
  parentId?: number;
}
