import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}
  async findUserById(id): Promise<User | null> {
    try {
      const user: User = await this.userRepository.getUserById(id);
      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        `Internal error to getUserById ${id}`,
      );
    }
  }

  async updateHomePageById({ id, homepage }): Promise<void> {
    try {
      await this.userRepository.updateHomePageById(id, homepage);
    } catch (error) {
      throw new InternalServerErrorException(
        `Internal error to homepageUpdate ${id}`,
      );
    }
  }
}
