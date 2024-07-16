import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RabbitMQProducerService } from './rabbitmq.producer.service';
import { RabbitmqConsumerService } from './rabbitmq.consumer.service';
import { LoggerModule } from '../logger/logger.module';
import { CommentModule } from '../comment/comment.module';
import {LoggerService} from "../logger/logger.service";

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    forwardRef(() => CommentModule),
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useFactory: (configService: ConfigService) => ({
        exchanges: [
          {
            name: configService.get<string>('RABBITMQ_EXCHANGE_NAME'),
            type: configService.get<string>('RABBITMQ_EXCHANGE_TYPE'),
          },
          {
            name: configService.get<string>('RABBITMQ_ACK_EXCHANGE_NAME'),
            type: configService.get<string>('RABBITMQ_EXCHANGE_TYPE'),
          },
        ],
        uri: configService.get<string>('RABBITMQ_URI'),
        connectionInitOptions: {
          wait: false,
          timeout: 10000,
          reject: true,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [RabbitMQProducerService, RabbitmqConsumerService],
  exports: [RabbitMQProducerService],
})
export class AppRabbitMQModule {}
