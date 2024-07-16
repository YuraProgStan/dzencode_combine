import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentRepository extends Repository<Comment> {
  constructor(@InjectRepository(Comment) private dataSource: DataSource) {
    super(Comment, dataSource.manager);
  }

  async createBulk(commentsToInsert): Promise<Comment[]> {
    const insertResult = await this.createQueryBuilder()
      .insert()
      .into(Comment)
      .values(commentsToInsert)
      .returning(['id', 'text'])
      .execute();
    return insertResult.raw || [];
  }

  async findCommentById(id): Promise<Comment> {
    return this.findOne({ where: { id } });
  }

  // async findComments(): Promise<Comment[]> {
  //   return this.find();
  // }
}
