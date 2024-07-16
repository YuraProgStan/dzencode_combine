import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ApolloError } from 'apollo-server-express';
import { IAuthGuard } from './interfaces';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements IAuthGuard {
  private request;

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    this.request = request;
    return request;
  }

  handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): any {
    if (err || !user) {
      throw new ApolloError('Unauthorized access', 'UNAUTHORIZED');
    }

    const token = this.request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new ApolloError('Unauthorized access', 'UNAUTHORIZED');
    }

    return user;
  }
}
