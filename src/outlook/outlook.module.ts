import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { PrismaModule } from '../prisma/prisma.module';
import { OutlookAuthService } from './outlook-auth.service';
import { OutlookCalendarSyncService } from './outlook-calendar-sync.service';
import { OutlookController } from './outlook.controller';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports:    [ConfigModule],
      inject:     [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret:      config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '7d') as StringValue,
        },
      }),
    }),
  ],
  controllers: [OutlookController],
  providers:   [OutlookAuthService, OutlookCalendarSyncService],
  exports:     [OutlookCalendarSyncService],
})
export class OutlookModule {}
