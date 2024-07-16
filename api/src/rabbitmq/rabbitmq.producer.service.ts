import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from '@nestjs/config';
import { Message } from '../comment/types';

@Injectable()
export class RabbitMQProducerService {
  private readonly exchange: string;

  private readonly routingKey: string;

  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly configService: ConfigService,
  ) {
    this.exchange = this.configService.get<string>('RABBITMQ_EXCHANGE_NAME');
    this.routingKey = this.configService.get<string>(
      'RABBITMQ_COMMENT_ROUTING_KEY',
    );
  }

  async pushMessage(message: Message): Promise<void> {
    await this.amqpConnection.publish(this.exchange, this.routingKey, message);
  }
}
