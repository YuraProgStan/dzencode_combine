import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SignInInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field(() => String, { description: 'password' })
  @IsNotEmpty()
  @Length(6, 24)
  password: string;
}
