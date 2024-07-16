// interfaces.ts
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

@ObjectType()
export class AcknowledgmentMessage {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  message: string;

  @Field(() => [Int])
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  ids: number[];
}
