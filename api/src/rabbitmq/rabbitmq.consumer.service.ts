import { Injectable } from '@nestjs/common';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { CommentService } from '../comment/comment.service';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LoggerService } from '../logger/logger.service';
import { AcknowledgmentMessage } from './dto/acknowledgment-message.dto';
dotenv.config();
@Injectable()
export class RabbitmqConsumerService {
  constructor(
    private configService: ConfigService,
    private commentService: CommentService,
    private logger: LoggerService,
  ) {}

  @RabbitRPC({
    exchange: process.env.RABBITMQ_ACK_EXCHANGE_NAME,
    routingKey: process.env.RABBITMQ_ACK_ROUTING_KEY, // Define your routing key for acknowledgment
    queue: process.env.RABBITMQ_ACK_QUEUE, // Define your callback queue name
  })
  async RabbitHandlerAcknowledgment(msg: any): Promise<void> {
    this.logger.info(
      `RabbitHandlerAknowledgment consume message: ${JSON.stringify(msg)}`,
    );
    try {
      const message: AcknowledgmentMessage = await this.validateMessage(msg);
      if (message && message.ids?.length) {
        await this.commentService.processAknowledgment(message.ids);
      }
    } catch (error) {
      this.logger.error(
        'Error processing message',error,
      );
    }
  }

  private async validateMessage(
    msg: any,
  ): Promise<AcknowledgmentMessage | null> {
    try {
      const message: AcknowledgmentMessage = plainToInstance(
        AcknowledgmentMessage,
        msg,
      );
      await validateOrReject(message, { whitelist: true });
      return message;
    } catch (error) {
      this.logger.error(
        `Error validating acknowledgment message: ${JSON.stringify(msg)}, Error: ${error}`,
      );
      return null;
    }
  }
}
