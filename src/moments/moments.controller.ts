import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MomentsService } from './moments.service';
import { CreateMomentDto } from './dto/moment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types/auth-user';

@UseGuards(JwtAuthGuard)
@Controller('families/:familyId/moments')
export class MomentsController {
  constructor(private momentsService: MomentsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  create(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Body() dto: CreateMomentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Image file is required');
    return this.momentsService.create(familyId, user.id, dto, file);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Param('familyId') familyId: string) {
    return this.momentsService.findAll(familyId, user.id);
  }

  @Delete(':momentId')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('momentId') momentId: string,
  ) {
    return this.momentsService.remove(familyId, momentId, user.id);
  }
}
