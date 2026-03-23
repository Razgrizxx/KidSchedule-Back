import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StripeModule } from '../stripe/stripe.module';
import type { StringValue } from 'ms';
import { PrismaModule } from '../prisma/prisma.module';
import { GoogleAuthService } from './google-auth.service';
import { GoogleCalendarSyncService } from './google-calendar-sync.service';
import { GoogleController } from './google.controller';

@Module({
  imports: [
    PrismaModule,
    StripeModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '7d') as StringValue,
        },
      }),
    }),
  ],
  controllers: [GoogleController],
  providers: [GoogleAuthService, GoogleCalendarSyncService],
  exports: [GoogleCalendarSyncService],
})
export class GoogleModule {}
