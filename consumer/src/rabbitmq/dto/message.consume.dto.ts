import { Type } from 'class-transformer';
import { Message } from './message.dto';
import { IsString } from 'class-validator';

export class DataMessageConsume {
  @Type(() => Message)
  message: Message;
}
export class MessageConsume {
  @IsString()
  pattern: string;
  @Type(() => DataMessageConsume)
  data: DataMessageConsume;
}
