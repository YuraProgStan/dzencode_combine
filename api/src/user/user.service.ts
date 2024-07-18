import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { ApolloError } from 'apollo-server-express';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  public async getUserByEmail(email) {
    return this.userRepository.getUserByEmail(email);
  }

  public async create(createUserInput) {
    const { password } = createUserInput;

    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    const createUser = { ...createUserInput, password: hashedPassword };
    return this.userRepository.createAndSave(createUser);
  }

  public async isUserExistWithCurrentEmailOrUsername(createUserInput) {
    const { username, email } = createUserInput;
    return this.userRepository.existUser(username, email);
  }

  public async validateUser({
    username,
    email,
    id,
  }: {
    username: string;
    email: string;
    id: number;
  }): Promise<boolean> {
    const user = await this.userRepository.getUserById(id);
    return user && user.username === username && user.email === email;
  }

  public async getUsersByIds(userIds): Promise<User[]> {
    try {
      const users = await this.userRepository.getUsersByIds(userIds);
      return users;
    } catch (error) {
      throw new ApolloError(
        'Failed to get user daata',
        'INTERNAL_SERVER_ERROR',
      );
    }
  }
}
