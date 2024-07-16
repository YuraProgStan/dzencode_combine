import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import { LoggerService } from './logger/logger.service';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger: LoggerService = app.get(LoggerService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: false,
      transform: true,
    }),
  );
  app.enableCors({
    origin: '*',
    // origin: [
    //   'http://localhost:3000',
    //   'http://127.0.0.1:3000',
    //   'http://client:3000',
    //   'http://54.87.53.74:3000',
    // ],
    credentials: true,
    allowedHeaders: [
      'Accept',
      'Authorization',
      'Content-Type',
      'X-Requested-With',
      'Authorization',
      'x-apollo-operation-name',
      'apollo-require-preflight',
    ],
    methods: ['GET', 'POST'],
  });
  app.use(graphqlUploadExpress({ maxFileSize: 1000000, maxFiles: 10 }));
  app.useGlobalFilters(new AllExceptionsFilter(logger));
  const configService = app.get(ConfigService);
  const PORT: number = configService.get<number>('APP_PORT') || 5000;
  await app.listen(PORT, () => {
    logger.info(`Server has been started on port ${PORT}`);
  });
}
bootstrap();
