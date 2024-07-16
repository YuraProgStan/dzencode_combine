import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

@InputType({ description: 'Create user object type.' })
export class CreateUserInput {
  @Field(() => String, { description: 'A new user name' })
  @IsNotEmpty({ message: 'The user should have a username' })
  @Length(3, 255)
  username: string;

  @Field(() => String, { description: 'A new user email' })
  @IsNotEmpty({ message: 'The user should have a email' })
  @IsEmail()
  email: string;

  @Field(() => String, { description: 'A new user password' })
  @IsNotEmpty()
  @Length(8, 24)
  password: string;
}
