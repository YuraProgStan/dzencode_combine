import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLUpload } from 'graphql-upload-ts';
import { CommentModule } from './comment/comment.module';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { LoggerService } from './logger/logger.service';
import { AppCacheModule } from './cache/cache.module';
import { AppElasticsearchModule } from './elasticsearch/elasticsearch.module';
import { AppController } from './app.controller';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // or ['.env.development', '.env.production']
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          entities: ['dist/**/*.entity{.ts,.js}'],
          debug: true,
          synchronize: true,
          autoLoadEntities: true,
          logging: true,
        };
      },
      inject: [ConfigService],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      installSubscriptionHandlers: true,
      debug: true,
      buildSchemaOptions: {
        numberScalarMode: 'integer', // Ensure this matches your needs
      },
      subscriptions: {
        'subscriptions-transport-ws': {
          path: '/graphql',
        },
      },
      playground: true,
      introspection: true,
      context: ({ req, res }) => ({ req, res }),
      status400ForVariableCoercionErrors: true,
    }),
    AppElasticsearchModule,
    AuthModule,
    UserModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'UPLOAD_SCALAR',
      useValue: GraphQLUpload,
    },
    LoggerService,
    AllExceptionsFilter,
  ],
})
export class AppModule {}
