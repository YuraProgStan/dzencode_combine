import {
  Resolver,
  Args,
  Mutation,
  Subscription,
  Int,
  Query,
} from '@nestjs/graphql';
import { Inject, UseGuards, UsePipes } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CommentService } from './comment.service';
import { PubSub } from 'graphql-subscriptions';
import {
  CommentsPaginationResponse,
  NewCommentSubscriptionResponse,
  ResponseComment,
} from './types';
import { PostCommentInput } from './dto/post-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ValidationCommentPipe } from './pipes/validation.comment.pipe';
import { CurrentUser } from '../user/decorators/users.decorator';
import { CurrentUserType } from '../user/types';
import { CommentSortBy } from './enums';
import { CacheService } from '../cache/cache.service';
import { LoggerService } from '../logger/logger.service';
import { ApolloError } from 'apollo-server-express';
import { deserializeDates, serializeDates } from '../utils/serialize-dates';

@Resolver()
export class CommentResolver {
  constructor(
    private readonly logger: LoggerService,
    private readonly userService: UserService,
    private readonly commentService: CommentService,
    @Inject('CACHE_COMMENT_MANAGER')
    private readonly cacheManager: CacheService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  @Query(() => [CommentsPaginationResponse], { name: 'comments' })
  async comments(
    @Args('limit', { type: () => Int, defaultValue: 25 }) limit: number,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('sortBy', {
      type: () => CommentSortBy,
      defaultValue: CommentSortBy.CREATED_AT,
    })
    sortBy: CommentSortBy,
    @Args('sortOrder', { type: () => String, defaultValue: 'DESC' })
    sortOrder: 'ASC' | 'DESC',
  ) {
    try {
      const cacheKey = `comments:${page}:${limit}:${sortBy}:${sortOrder}`;
      const cachedComments = await this.cacheManager.get(cacheKey);
      if (cachedComments) {
        const deserializedComments = cachedComments.map(deserializeDates);
        return deserializedComments;
      }
      const comments = await this.commentService.processComments(
        limit,
        page,
        sortBy,
        sortOrder,
      );
      if (!comments.length) {
        // Cache the empty result set
        await this.cacheManager.set(cacheKey, []);
        return [];
      }

      const commentsToCache = comments.map(serializeDates);
      await this.cacheManager.set(cacheKey, commentsToCache);
      return comments;
    } catch (error) {
      this.logger.error('Error fetching comments:', error);
      throw new ApolloError(
        'Failed to fetch comments',
        'INTERNAL_SERVER_ERROR',
      );
    }
  }

  @Mutation(() => ResponseComment)
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationCommentPipe)
  async postComment(
    @Args('input') input: PostCommentInput,
    @CurrentUser() user: CurrentUserType,
  ): Promise<ResponseComment> {
    const isProcessed: boolean = await this.commentService.processComment(
      input,
      user,
    );
    if (!isProcessed) {
      return { success: false, message: 'comment not processed' };
    }
    return { success: true, message: 'comment successfully processed' };
  }

  @Subscription(() => [NewCommentSubscriptionResponse], {
    name: 'newComments',
  })
  newComments() {
    return this.pubSub.asyncIterator('newComments');
  }
}
