import { Module } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { ChildrenController } from './children.controller';
import { FamilyModule } from '../family/family.module';

@Module({
  imports: [FamilyModule],
  providers: [ChildrenService],
  controllers: [ChildrenController],
})
export class ChildrenModule {}
