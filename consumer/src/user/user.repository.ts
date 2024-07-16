import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(@InjectRepository(User) private dataSource: DataSource) {
    super(User, dataSource.manager);
  }

  async updateHomePageById(id: number, homepage: string): Promise<void> {
    await this.createQueryBuilder()
      .update(User)
      .set({ homepage: homepage })
      .where('id = :id', { id })
      .execute();
  }

  async getUserById(id: number): Promise<User> {
    return this.findOne({ where: { id } });
  }
}
