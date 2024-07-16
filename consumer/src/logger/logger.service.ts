import { Injectable } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';

@Injectable()
export class LoggerService {
  private logger: ReturnType<typeof createLogger>;

  constructor() {
    this.logger = createLogger({
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`,
        ),
      ),
      transports: [new transports.File({ filename: 'combined.log' })],
    });
  }

  info(message: string, context?: Record<string, any>) {
    if (context) {
      this.logger.info(`${message}`, context);
    } else {
      this.logger.info(message);
    }
  }

  error(message: string, context?: Record<string, any>) {
    if (context) {
      this.logger.error(`${message}`, context);
    } else {
      this.logger.error(message);
    }
  }
}
