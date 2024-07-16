import { Field, InputType, Int } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';
import { IsEmail, IsOptional, Matches } from 'class-validator';
import { MESSAGES, REGEX } from '../../utils/service';

@InputType({ description: 'Create comment object type.' })
export class PostCommentInput {
  @Field()
  @Matches(REGEX.USERNAME_RULE, { message: MESSAGES.USERNAME_RULE_MESSAGE })
  username: string;

  @Field()
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @Field({ nullable: true })
  @IsOptional()
  @Matches(REGEX.HOME_URL_RULE, { message: MESSAGES.HOME_URL_RULE_MESSAGE })
  homepage?: string;

  @Field()
  @Matches(REGEX.CAPTCHA_RULE, { message: MESSAGES.CAPTCHA_RULE_MESSAGE })
  captcha: string;

  @Field()
  @Matches(REGEX.TEXT_RULE, { message: MESSAGES.TEXT_RULE_MESSAGE })
  text: string;

  @Field(() => GraphQLUpload, { nullable: true })
  @IsOptional()
  file?: Promise<FileUpload>;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  parentId?: number;
}
