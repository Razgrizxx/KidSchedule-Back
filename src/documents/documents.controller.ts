import {
  Controller, Delete, Get, Param, Post, Query,
  UploadedFile, UseGuards, UseInterceptors, Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DocumentsService } from './documents.service';
import { DocumentCategory } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('families/:familyId/documents')
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  upload(
    @CurrentUser() user: { id: string },
    @Param('familyId') familyId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
    @Body('category') category: DocumentCategory,
    @Body('description') description?: string,
    @Body('childId') childId?: string,
  ) {
    return this.service.upload(familyId, user.id, file, {
      title,
      category,
      description,
      childId,
    });
  }

  @Get()
  findAll(
    @Param('familyId') familyId: string,
    @Query('childId') childId?: string,
    @Query('category') category?: DocumentCategory,
  ) {
    return this.service.findAll(familyId, childId, category);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: { id: string },
    @Param('familyId') familyId: string,
    @Param('id') id: string,
  ) {
    return this.service.remove(familyId, id, user.id);
  }
}
