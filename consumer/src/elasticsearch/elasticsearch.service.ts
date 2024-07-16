import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { LoggerService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { BulkOperation } from '../comment/types/comment-bulk.type';

@Injectable()
export class AppElasticsearchService {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  private indexIndexName: string = this.configService.get(
    'ELASTICSEARCH_INDEX_NAME',
  );

  async createBulk(comments): Promise<any> {
    const bulkOperations: BulkOperation[] = comments.flatMap((comment) => [
      { index: { _index: this.indexIndexName } },
      comment,
    ]);
    const bulkResponse = await this.elasticsearchService.bulk({
      refresh: true,
      operations: bulkOperations,
    });

    if (bulkResponse.errors) {
      const erroredDocuments = bulkResponse.items.reduce(
        (acc: any[], item: any, i: number) => {
          const operation = Object.keys(item)[0];
          if (item[operation].error) {
            acc.push({
              status: item[operation].status,
              error: item[operation].error,
              operation: bulkOperations[i * 2],
              document: bulkOperations[i * 2 + 1],
            });
          }
          return acc;
        },
        [],
      );
      this.logger.error('Failed to index some documents:', erroredDocuments);
    } else {
      this.logger.info('All documents indexed successfully');
    }

    if (!bulkResponse) {
      this.logger.error('Failed to execute bulk in ElasticSearch');
    }
  }
}
