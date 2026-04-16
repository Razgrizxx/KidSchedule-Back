import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { TestMailService } from './test-mail.service';

@Module({
  controllers: [TestController],
  providers: [TestMailService],
})
export class TestModule {}
