import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-ioredis';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          store: redisStore,
          host: configService.get('REDIS_HOST') || 'localhost',
          port: parseInt(configService.get('REDIS_PORT'), 10) || 6379,
          db: 0,
          ttl: parseInt(configService.get('REDIS_TTL'), 10) || 3600,
          connectTimeout: 10000,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: 'CACHE_COMMENT_MANAGER',
      useClass: CacheService,
    },
    ConfigService,
  ],
  exports: ['CACHE_COMMENT_MANAGER'],
})
export class AppCacheModule {}
