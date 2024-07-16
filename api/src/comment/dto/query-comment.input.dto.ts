import { InputType, Field } from '@nestjs/graphql';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { CommentSortBy } from '../enums';

@InputType()
export class QueryCommentInput {
  @IsEnum(CommentSortBy)
  sortBy?: CommentSortBy;

  @Field(() => String, { nullable: true } as null)
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';

  @Field()
  @IsInt()
  page: number;
}
