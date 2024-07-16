import { AuthService } from './auth.service';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { LocalAuthGuard } from './local-auth.guard';
import {
  BadRequestException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthPayload } from './types';
import { CurrentUser } from '../user/decorators/users.decorator';
import { ApolloError } from 'apollo-server-express';
import { User } from '../user/entities/user.entity';
import { CurrentUserType } from '../user/types';
import { SignInInput } from '../user/dto/sign-in.input.dto';
import { UserInputError } from '@nestjs/apollo';
import { CreateUserInput } from '../user/dto/create-user.input.dto';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Mutation(() => AuthPayload, { name: 'signIn' })
  async logIn(
    @Args('signInInput') signInInput: SignInInput,
    @CurrentUser() user: CurrentUserType,
  ): Promise<{ access_token: string }> {
    try {
      return this.authService.generateToken(user);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new ApolloError('Failed to log in', 'INTERNAL_SERVER_ERROR');
    }
  }

  @Mutation(() => User, {
    name: 'signUp',
    nullable: true,
  })
  async signUp(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<User> {
    try {
      return this.authService.create(createUserInput);
    } catch (error) {
      if (error instanceof UserInputError) {
        throw error;
      } else {
        throw new ApolloError('Failed to sign up', 'INTERNAL_SERVER_ERROR');
      }
    }
  }
}
