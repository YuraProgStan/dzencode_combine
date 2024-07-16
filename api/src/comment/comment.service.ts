import { Inject, Injectable } from '@nestjs/common';
import { CommentRepository } from './comment.repository';
import { Buffer } from 'buffer';
import { ApolloError } from 'apollo-server-express';
import { streamToBuffer } from '../utils/stream-to-buffer';
import { PostCommentInput } from './dto/post-comment.dto';
import { IMAGE_DIMENSION_HIGH, IMAGE_DIMENSION_WITH } from '../constants';
import { cropImageToCenter } from '../utils/crop-image';
import { UserInputError } from '@nestjs/apollo';
import dayjs from 'dayjs';
import { editFileName } from '../utils/edit.file.name';
import { FileUploadAwsService } from '../fileupload-aws/fileupload-aws.service';
import { FileUpload } from 'graphql-upload-ts';
import fromBuffer from 'image-size';
import { CurrentUserType } from '../user/types';
import {
  CommentsPaginationResponse,
  NewCommentSubscriptionResponse,
} from './types';
import { CommentSortBy } from './enums';
import { LoggerService } from '../logger/logger.service';
import { RabbitMQProducerService } from '../rabbitmq/rabbitmq.producer.service';
import { PubSub } from 'graphql-subscriptions';
import { validate } from 'class-validator';
import { Comment } from './entities/comment.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly fileUploadAwsService: FileUploadAwsService,
    private readonly producerQueueService: RabbitMQProducerService,
    private readonly logger: LoggerService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  public async processComment(
    comment: PostCommentInput,
    user: CurrentUserType,
  ) {
    const { file, homepage, text, parentId } = comment;

    try {
      let fileUrl;
      if (file) {
        fileUrl = await this.processFile(file);
      }

      await this.producerQueueService.pushMessage({
        userId: user.id,
        text,
        ...(parentId && { parentId }),
        ...(homepage && { homepage }),
        ...(fileUrl && { fileUrl }),
      });

      return true; // Successfully posted comment
    } catch (error) {
      if (error instanceof UserInputError) {
        throw error;
      } else {
        throw new ApolloError(
          'An unexpected error occurred during processing comment',
          'INTERNAL_SERVER_ERROR',
        );
      }
    }
  }

  private async processFile(file: Promise<FileUpload>): Promise<string> {
    const { mimetype, createReadStream, filename } = await file;
    const buffer = await streamToBuffer(createReadStream());
    let processedFileBuffer: Buffer;
    let type: string;

    if (mimetype !== 'text/plain') {
      processedFileBuffer = await this.processImage(buffer);
      type = 'image';
    } else {
      processedFileBuffer = buffer;
      type = 'text';
    }

    const createdFileName = this.createFileName(filename, type);
    // Upload file to AWS and get URL
    return this.fileUploadAwsService.uploadFile(
      processedFileBuffer,
      createdFileName,
    );
  }

  private async processImage(buffer: Buffer): Promise<Buffer> {
    try {
      const { width, height } = fromBuffer(buffer);

      if (width > IMAGE_DIMENSION_WITH || height > IMAGE_DIMENSION_HIGH) {
        return await cropImageToCenter(buffer);
      }
      return buffer;
    } catch (error) {
      throw new UserInputError('Invalid image file.');
    }
  }

  private createFileName(filename: string, type: string): string {
    const subfolder = dayjs().format('DD_MM_YYYY');
    const editedFileName = editFileName(filename);
    return `test_dzencode/${subfolder}/photo/${type}/${editedFileName}`;
  }

  public async processComments(
    limit: number,
    page: number,
    sortBy: CommentSortBy,
    sortOrder: 'ASC' | 'DESC',
  ): Promise<CommentsPaginationResponse[]> {
    try {
      const offset: number = (page - 1) * limit;
      const rawData: CommentsPaginationResponse[] =
        await this.commentRepository.searchComments(
          limit,
          offset,
          sortBy,
          sortOrder,
        );
      if (!rawData || rawData.length === 0) {
        return [];
      }
      const comments = await this.mapAndValidateComments(rawData);

      return comments;
    } catch (error) {
      this.logger.error('Error processing subscription comments', error);
      throw new ApolloError(
        'Failed to process subscription comments',
        'INTERNAL_SERVER_ERROR',
      );
    }
  }

  public async processAknowledgment(ids: number[]): Promise<void> {
    try {
      const commentsFromDb =
        await this.commentRepository.findCommentsRelationByIds(ids);

      const comments: NewCommentSubscriptionResponse[] = commentsFromDb.map(
        (comment) => ({
          id: comment.comment_id,
          text: comment.comment_text,
          fileUrl: comment.comment_fileUrl,
          createdAt: comment.comment_createdAt,
          user: {
            username: comment.user_username,
            email: comment.user_email,
            homepage: comment.user_homepage,
          },
          parentId: comment.parentId || null,
        }),
      );

      if (comments.length > 0) {
        await this.pubSub.publish('newComments', {
          newComments: comments.map((comment) => {
            this.logger.info(`Publishing comment: ${JSON.stringify(comment)}`);
            return comment;
          }),
        });
      }
    } catch (error) {
      this.logger.error('Error processing acknowledgment comments', error);
    }
  }

  async mapAndValidateComments(data: any[]): Promise<Comment[]> {
    try {
      const result = data.map((row) => {
        const comment = new Comment();
        comment.id = row.comment_id;
        comment.text = row.comment_text;
        comment.fileUrl = row.comment_file_url;
        comment.createdAt = new Date(row.comment_created_at);
        comment.updatedAt = new Date(row.comment_updated_at);

        // Mapping user
        const user = new User();
        user.username = row.user_username;
        user.email = row.user_email;
        user.homepage = row.user_homepage;
        comment.user = user;

        if (row.comment_parent_id) {
          const parentComment = new Comment();
          parentComment.id = row.comment_parent_id;
          comment.parent = parentComment;
        } else {
          comment.parent = null;
        }

        if (
          row.children &&
          Array.isArray(row.children) &&
          row.children.length > 0
        ) {
          comment.children = row.children.map((child) => {
            const childComment = new Comment();
            childComment.id = child.comment_id;
            childComment.text = child.comment_text;
            childComment.fileUrl = child.comment_file_url;
            childComment.createdAt = new Date(child.comment_created_at);
            childComment.updatedAt = new Date(child.comment_updated_at);

            // Mapping user for child comment
            const childUser = new User();
            childUser.username = child.user_username;
            childUser.email = child.user_email;
            childUser.homepage = child.user_homepage;
            childComment.user = childUser;

            // Mapping parent for child comment if exists
            if (child.comment_parent_id) {
              const childParentComment = new Comment();
              childParentComment.id = child.comment_parent_id;
              childComment.parent = childParentComment;
            } else {
              childComment.parent = null;
            }

            return childComment;
          });
        } else {
          comment.children = [];
        }

        return comment;
      });

      await Promise.all(
        result.map(async (comment) => {
          await validate(comment, { whitelist: true });
        }),
      );

      return result;
    } catch (error) {
      this.logger.error('Error mapping and validating comments', error);
      throw new ApolloError(
        'Error mapping and validating comments:',
        (error as any).message,
      );
    }
  }
}
