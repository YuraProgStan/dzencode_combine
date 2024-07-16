import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { CommentService } from './comment.service';
import { CommentResolver } from './comment.resolver';
import { CommentRepository } from './comment.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { AppRabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { AppCacheModule } from '../cache/cache.module';
import { FileUploadAwsService } from '../fileupload-aws/fileupload-aws.service';
import { LoggerModule } from '../logger/logger.module';
import { PubSubModule } from '../pubsub/pubsub.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => AppRabbitMQModule),
    AppCacheModule,
    TypeOrmModule.forFeature([Comment]),
    LoggerModule,
    PubSubModule,
  ],
  providers: [
    CommentService,
    CommentResolver,
    CommentRepository,
    FileUploadAwsService,
  ],
  exports: [CommentService],
})
export class CommentModule {}
