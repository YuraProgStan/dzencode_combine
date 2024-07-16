import { forwardRef, Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { LoggerModule } from '../logger/logger.module';
import { UserModule } from '../user/user.module';
import { CommentRepository } from './comment.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { AppElasticsearchModule } from '../elasticsearch/elasticsearch.module';
import { AppRabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [
    AppElasticsearchModule,
    forwardRef(() => AppRabbitMQModule),
    LoggerModule,
    UserModule,
    TypeOrmModule.forFeature([Comment]),
  ],
  providers: [CommentService, CommentRepository],
  exports: [CommentService],
})
export class CommentModule {}
