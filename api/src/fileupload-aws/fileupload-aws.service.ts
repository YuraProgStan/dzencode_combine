import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Buffer } from 'buffer';
import * as AWS from 'aws-sdk';
import { LoggerService } from '../logger/logger.service';
import { ApolloError } from 'apollo-server-express';

@Injectable()
export class FileUploadAwsService {
  private readonly s3: AWS.S3;

  constructor(
    private configService: ConfigService,
    private logger: LoggerService,
  ) {
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get<string>('aws.S3_ACCESS_KEY'),
      secretAccessKey: this.configService.get<string>('aws.S3_SECRET_KEY'),
      region: this.configService.get<string>('aws.S3_REGION'),
    });
  }

  async uploadFile(buffer: Buffer, fileName: string): Promise<string> {
    const params = {
      Bucket: this.configService.get<string>('AWS_S3_NAME'),
      Key: fileName,
      Body: buffer,
    };
    let uploadResult;
    try {
      uploadResult = await this.s3.upload(params).promise();
    } catch (error) {
      this.logger.error('File upload failed', error);
      throw new ApolloError('File upload failed', (error as any).message);
    }

    if (!uploadResult.Location) {
      this.logger.error('File upload failed');
      throw new ApolloError('File upload failed');
    }
    this.logger.info('success upload');

    return uploadResult.Location;
  }
}
