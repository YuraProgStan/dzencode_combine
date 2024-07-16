import { Injectable, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { IndicesCreateRequest } from '@elastic/elasticsearch/lib/api/types';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class ElasticsearchInitializationService implements OnModuleInit {
  private indexSearchCommentName: string;

  private indicesConfig: IndicesCreateRequest[];

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.indexSearchCommentName = this.configService.get(
      'ELASTICSEARCH_INDEX_NAME',
    );

    if (!this.indexSearchCommentName) {
      throw new Error(
        'ELASTICSEARCH_INDEX_NAME is not defined in configuration.',
      );
    }

    this.indicesConfig = [
      {
        index: this.indexSearchCommentName,
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0,
        },
        mappings: {
          properties: {
            id: { type: 'integer' },
            text: { type: 'text' },
          },
        },
      },
    ];

    await this.createIndex(this.indicesConfig[0]);
  }

  async createIndex(body: IndicesCreateRequest): Promise<any> {
    try {
      const exists = await this.elasticsearchService.indices.exists({
        index: body.index,
      });

      if (!exists) {
        await this.elasticsearchService.indices.create(body);
        this.logger.info(`Index ${body.index} is successfully created`);
      } else {
        this.logger.info(`Index ${body.index} already exists`);
      }
    } catch (error) {
      this.logger.error(`Error creating index ${body.index}:`, error);
    }
  }
}
