import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CurrentUserType {
  @Field(() => ID)
  id: number;

  @Field()
  username: string;
}

@ObjectType()
export class UserWithPassword {
  @Field(() => ID)
  id: number;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  username: string;

  @Field({ nullable: true })
  homePage?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
