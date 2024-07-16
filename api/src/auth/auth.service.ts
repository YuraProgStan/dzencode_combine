import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserInputError } from '@nestjs/apollo';
import { ApolloError } from 'apollo-server-express';
import { User } from '../user/entities/user.entity';
import { UserWithPassword } from '../user/types';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async validateUserCreds(email: string, password: string): Promise<User> {
    try {
      const user: UserWithPassword =
        await this.userService.getUserByEmail(email);

      if (!user) {
        throw new UserInputError('User not found');
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new ApolloError('Invalid password', 'UNAUTHORIZED');
      }

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    } catch (error) {
      if (error instanceof UserInputError) {
        throw error;
      } else if (error instanceof ApolloError) {
        throw new ApolloError('Invalid password', 'UNAUTHORIZED');
      } else {
        throw new ApolloError(
          'Failed to validate user credentials',
          'INTERNAL_SERVER_ERROR',
          { error },
        );
      }
    }
  }

  async generateToken(user: any) {
    const token = {
      access_token: this.jwtService.sign({
        sub: user.id,
        username: user.username,
      }),
    };
    return token;
  }

  async create(user: any) {
    const isUserExistWithCurrentEmailOrUsername =
      await this.userService.isUserExistWithCurrentEmailOrUsername(user);
    if (isUserExistWithCurrentEmailOrUsername) {
      throw new UserInputError(
        'User with input email or password already exists',
      );
    }
    return this.userService.create(user);
  }
}
