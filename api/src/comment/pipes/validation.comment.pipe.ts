import { PipeTransform, Injectable } from '@nestjs/common';
import { isCurrentUserType } from '../../utils/isCurrentUserType';
import { UserService } from '../../user/user.service';
import { CurrentUserType } from '../../user/types';
import { MAX_TXT_FILE_SIZE, MESSAGES, REGEX } from '../../utils/service';
import { UserInputError } from '@nestjs/apollo';
import { PostCommentInput } from '../dto/post-comment.dto';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class ValidationCommentPipe implements PipeTransform {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
    private logger: LoggerService,
  ) {}

  private currentUser: CurrentUserType | null = null;

  async transform(
    value: CurrentUserType | PostCommentInput,
  ): Promise<CurrentUserType | PostCommentInput> {
    if (isCurrentUserType(value)) {
      this.setCurrentUser(value);
      return value;
    }
    const { file, username, email, captcha } = value;
    const isCaptchaValid = await this.validateCaptcha(captcha);
    if (!isCaptchaValid) {
      this.logger.error('reCAPTCHA validation failed.');
      throw new UserInputError('reCAPTCHA validation failed.');
    }

    const currentUser = this.getCurrentUser() as CurrentUserType;

    await this.validateUser(username, email, currentUser.id);
    if (file !== undefined && file !== null) {
      await this.fileValidate(file);
    }
    this.setCurrentUser(null);

    return value;
  }

  private async validateUser(username: string, email: string, id: number) {
    const isUserValid = await this.userService.validateUser({
      username,
      email,
      id,
    });

    if (!isUserValid) {
      this.logger.error(
        'User email or username not valid for current user. Sign in first.',
      );
      throw new UserInputError(
        'User email or username not valid for current user. Sign in first.',
      );
    }
  }

  async validateCaptcha(token: string): Promise<boolean> {
    const recaptchaSecretKey = this.configService.get<string>(
      'RECAPTCHA_SECRET_KEY',
    );
    try {
      const response = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${token}`,
      );
      const { success } = response.data;
      return success;
    } catch (error) {
      this.logger.error('Error validating reCAPTCHA:', error);
      return false;
    }
  }

  async fileValidate(file) {
    const { createReadStream, filename } = await file;
    const fileExtension = filename.split('.').pop();
    if (!fileExtension.match(REGEX.ALLOWED_FILE_EXTENSIONS)) {
      this.logger.error(
        `File type not allowed (${fileExtension}), only ${MESSAGES.FILE_EXTENSION_RULE_MESSAGE}`,
      );
      throw new UserInputError(
        `File type not allowed (${fileExtension}), only ${MESSAGES.FILE_EXTENSION_RULE_MESSAGE}`,
      );
    }
    if (fileExtension === 'txt') {
      const fileSize = createReadStream().readableLength;
      if (fileSize > MAX_TXT_FILE_SIZE) {
        throw new UserInputError(`${MESSAGES.FILE_SIZE_TEXT_RULE_MESSAGE}`);
      }
    }
  }

  private setCurrentUser(user) {
    this.currentUser = user;
  }

  private getCurrentUser() {
    return this.currentUser;
  }
}
