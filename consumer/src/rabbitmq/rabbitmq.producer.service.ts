import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RabbitMQProducerService {
  private readonly ack_exchange;
  private readonly ack_routing_key;

  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly configService: ConfigService,
  ) {
    this.ack_exchange = this.configService.get<string>(
      'RABBITMQ_ACK_EXCHANGE_NAME',
    );
    this.ack_routing_key = this.configService.get<string>(
      'RABBITMQ_ACK_ROUTING_KEY',
    );
  }

  public async publishAcknowledgment(ids: number[]): Promise<void> {
    const acknowledgmentMessage = {
      success: true,
      message: `Processed ${ids.length} messages`,
      ids: ids,
    };

    await this.amqpConnection.publish(
      this.ack_exchange,
      this.ack_routing_key,
      acknowledgmentMessage,
    );
  }
}
