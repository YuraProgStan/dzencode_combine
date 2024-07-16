import { Injectable } from '@nestjs/common';
import {
  RabbitRPC,
} from '@golevelup/nestjs-rabbitmq';
import * as dotenv from 'dotenv';
import { CommentService } from '../comment/comment.service';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Message } from './dto/message.dto';
import { LoggerService } from '../logger/logger.service';
dotenv.config();
@Injectable()
export class RabbitmqConsumerService {
  private messagesBuffer: Message[] = [];
  private readonly BATCH_SIZE: number = Number(
    process.env.RABBITMQ_PREFETCH_COUNT,
  );
  private readonly BATCH_PROCESS_INTERVAL: number = Number(
    process.env.RABBITMQ_BATCH_PROCESS_INTERVAL,
  );

  constructor(
    private commentService: CommentService,
    private logger: LoggerService,
  ) {
    this.startBatchProcessingTimer();
  }

  private startBatchProcessingTimer() {
    setInterval(() => this.processBatch(), this.BATCH_PROCESS_INTERVAL);
  }

  @RabbitRPC({
    exchange: process.env.RABBITMQ_EXCHANGE_NAME,
    routingKey: process.env.RABBITMQ_COMMENT_ROUTING_KEY,
    queue: process.env.RABBITMQ_COMMENT_QUEUE,
  })
  public async RabbitHandler(msg: any): Promise<any> {
    try {
      const validatedMsg: Message = await this.validateMessage(msg);
      this.messagesBuffer.push(validatedMsg);
    } catch (error) {
      // Handle validation errors
      this.logger.error(
        'Error processing message', error,
      );
    }
  }

  private async validateMessage(message: Message): Promise<Message> {
    const mappedMsg: Message = plainToInstance(Message, message);
    try {
      await validateOrReject(mappedMsg, { whitelist: true });
    } catch (error) {
      this.logger.error(
        `Error validating comment message: ${JSON.stringify(message)}`, error,
      );
    }
    return mappedMsg;
  }

  private async processBatch() {
    let batch: Message[] | [] = [];
    if (this.messagesBuffer.length >= this.BATCH_SIZE) {
      batch = this.messagesBuffer.splice(0, this.BATCH_SIZE);
    } else {
      if (this.messagesBuffer.length > 0) {
        batch = this.messagesBuffer.splice(0, this.messagesBuffer.length);
      }
    }
    if (batch.length > 0) {
      await this.commentService.processComments(batch);
    }
  }
}
