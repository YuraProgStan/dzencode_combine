import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitmqConsumerService } from './rabbitmq.consumer.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { CommentModule } from '../comment/comment.module';
import { LoggerModule } from '../logger/logger.module';
import { RabbitMQProducerService } from './rabbitmq.producer.service';

@Module({
  imports: [
    forwardRef(() => CommentModule),
    ConfigModule,
    LoggerModule,
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
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
          channels: {
            [configService.get<string>('RABBITMQ_CHANNEL')]: {
              prefetchCount: Number(
                configService.get('RABBITMQ_PREFETCH_COUNT'),
              ),
            },
          },
            connectionInitOptions: {
                wait: false, // Disable waiting for the connection to be established
                timeout: 20000, // Timeout in milliseconds (e.g., 10 seconds)
                reject: true, // Reject connection on timeout
            },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [ConfigService, RabbitmqConsumerService, RabbitMQProducerService],
  exports: [RabbitMQProducerService],
})
export class AppRabbitMQModule {}
