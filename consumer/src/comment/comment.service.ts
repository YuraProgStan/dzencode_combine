import { Injectable } from '@nestjs/common';
import { Message } from '../rabbitmq/dto/message.dto';
import { Comment } from './entities/comment.entity';
import { UserService } from '../user/user.service';
import { CommentRepository } from './comment.repository';
import { LoggerService } from '../logger/logger.service';
import { CommentElastic } from './interfaces/comment-elastic.interface';
import { AppElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { RabbitMQProducerService } from '../rabbitmq/rabbitmq.producer.service';

@Injectable()
export class CommentService {
  constructor(
    private userService: UserService,
    private commentRepository: CommentRepository,
    private elasticsearchService: AppElasticsearchService,
    private rabbitmqProducerService: RabbitMQProducerService,
    private logger: LoggerService,
  ) {}

  async processComments(messages: Message[]): Promise<void> {
    const commentsToInsert: Comment[] = [];

    for (const msg of messages) {
      try {
        const comment = new Comment();
        comment.text = msg.text;
        comment.fileUrl = msg.fileUrl || null;

        if (msg.parentId) {
          const parentCommentExist =
            await this.commentRepository.findCommentById(msg.parentId);

          if (!parentCommentExist) {
            this.logger.info(
              `Parent comment with id = ${msg.parentId} does not exist, so nested comment from userId = ${msg.userId} will not be processed`,
            );
            continue;
          }

          comment.parent = parentCommentExist;
        }

        const user = await this.userService.findUserById(msg.userId);
        if (!user) {
          this.logger.info(
            `User with id = ${msg.userId} does not exist, so the comment will not be processed`,
          );
          continue;
        }
        comment.user = user;

        if (msg.homepage) {
          await this.userService.updateHomePageById({
            id: msg.userId,
            homepage: msg.homepage,
          });
        }
        commentsToInsert.push(comment);
      } catch (error) {
        this.logger.error('Error processing comment', error);
      }
    }
    try {
      if (commentsToInsert.length) {
        const insertedComments =
          await this.commentRepository.createBulk(commentsToInsert);

        if (insertedComments.length) {
          const ids = insertedComments.map((comment) => comment.id);
          const dataForElastic: CommentElastic[] = insertedComments.map(
            (comment) => ({
              id: comment.id,
              text: comment.text,
            }),
          );

          await Promise.all([
            this.rabbitmqProducerService.publishAcknowledgment(ids),
            this.elasticsearchService.createBulk(dataForElastic),
          ]);
        }
      }
    } catch (error) {
      this.logger.error('Error bulk inserting comments', error);
    }
  }
}
