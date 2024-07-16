import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(@InjectRepository(User) private dataSource: DataSource) {
    super(User, dataSource.manager);
  }

  public async existUser(username: string, email: string): Promise<User> {
    const existingUser = await this.createQueryBuilder('user')
      .where('user.email = :email OR user.username = :username', {
        email,
        username,
      })
      .getOne();

    return existingUser || null;
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    const user: User = await this.createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getRawOne();

    return user || null;
  }

  public async createAndSave(createdUser: Partial<User>): Promise<User> {
    const user: User = this.create(createdUser);
    return this.save(user);
  }

  public async getUserById(id: number): Promise<User | null> {
    const user: User = await this.findOne({
      where: { id },
    });
    return user || null;
  }

  public async getUsersByIds(ids): Promise<User[] | []> {
    const data: User[] = await this.createQueryBuilder('user')
      .where('user.id IN (:ids)', { ids })
      .getMany();
    return data;
  }
}
