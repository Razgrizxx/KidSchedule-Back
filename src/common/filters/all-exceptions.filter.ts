import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      // getResponse() can be a plain string or { message, error, statusCode }
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const body = res as Record<string, unknown>;
        if (Array.isArray(body.message)) {
          message = body.message as string[];
        } else if (typeof body.message === 'string') {
          message = body.message;
        }
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002 — unique constraint violation
      if (exception.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        this.logger.debug(`P2002 meta: ${JSON.stringify(exception.meta)}`);
        const target = exception.meta?.target;
        // target can be string[], string, or undefined depending on Prisma version
        const rawFields: string[] = Array.isArray(target)
          ? (target as string[])
          : typeof target === 'string'
            ? target.split(',').map((s) => s.trim())
            : [];
        const fieldLabels: Record<string, string> = {
          email: 'Email',
          phone: 'Phone',
          name: 'Name',
          username: 'Username',
          inviteCode: 'Invite code',
        };
        const readable = rawFields
          .map((f) => fieldLabels[f] ?? f)
          .join(' and ');
        message = readable
          ? `${readable} is already registered`
          : 'This record already exists';
      // P2025 — record not found
      } else if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
      } else {
        this.logger.error(`Prisma error ${exception.code}`, exception.message);
        message = 'Error de base de datos';
      }
    } else {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}
