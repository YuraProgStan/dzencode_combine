// interfaces.ts
import { IsNumber, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class Message {
  @IsNumber()
  userId: number;

  @IsString()
  text: string;

  @IsOptional()
  @Type(() => Number)
  parentId?: number;

  @IsOptional()
  @IsString()
  homepage?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;
}
