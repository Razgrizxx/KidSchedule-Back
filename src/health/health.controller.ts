import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/interfaces/auth-user.interface';
import { HealthService } from './health.service';
import {
  CreateHealthRecordDto,
  UpdateHealthRecordDto,
  CreateMedicationDto,
  UpdateMedicationDto,
  CreateAllergyDto,
  CreateDocumentDto,
} from './dto/health.dto';

@UseGuards(JwtAuthGuard)
@Controller('families/:familyId/health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  // ── Summary ───────────────────────────────────────────────────────────────

  @Get('summary/:childId')
  getSummary(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('childId') childId: string,
  ) {
    return this.healthService.getSummary(familyId, user.id, childId);
  }

  // ── Health Records ────────────────────────────────────────────────────────

  @Post('records')
  createRecord(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Body() dto: CreateHealthRecordDto,
  ) {
    return this.healthService.createRecord(familyId, user.id, dto);
  }

  @Get('records')
  getRecords(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Query('childId') childId?: string,
  ) {
    return this.healthService.getRecords(familyId, user.id, childId);
  }

  @Get('records/:recordId')
  getRecord(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('recordId') recordId: string,
  ) {
    return this.healthService.getRecord(familyId, recordId, user.id);
  }

  @Patch('records/:recordId')
  updateRecord(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('recordId') recordId: string,
    @Body() dto: UpdateHealthRecordDto,
  ) {
    return this.healthService.updateRecord(familyId, recordId, user.id, dto);
  }

  @Delete('records/:recordId')
  deleteRecord(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('recordId') recordId: string,
  ) {
    return this.healthService.deleteRecord(familyId, recordId, user.id);
  }

  // ── Documents ─────────────────────────────────────────────────────────────

  @Post('documents')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
      fileFilter: (_req, file, cb) => {
        const allowed = [
          'image/jpeg', 'image/png', 'image/webp',
          'application/pdf',
        ];
        if (!allowed.includes(file.mimetype)) {
          return cb(new BadRequestException('Only images and PDFs are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadDocument(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Body() dto: CreateDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('File is required');
    return this.healthService.uploadDocument(familyId, user.id, dto, file);
  }

  @Get('documents')
  getDocuments(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Query('childId') childId?: string,
  ) {
    return this.healthService.getDocuments(familyId, user.id, childId);
  }

  @Delete('documents/:documentId')
  deleteDocument(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('documentId') documentId: string,
  ) {
    return this.healthService.deleteDocument(familyId, documentId, user.id);
  }

  // ── Medications ───────────────────────────────────────────────────────────

  @Post('medications')
  createMedication(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Body() dto: CreateMedicationDto,
  ) {
    return this.healthService.createMedication(familyId, user.id, dto);
  }

  @Get('medications')
  getMedications(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Query('childId') childId?: string,
  ) {
    return this.healthService.getMedications(familyId, user.id, childId);
  }

  @Patch('medications/:medicationId')
  updateMedication(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('medicationId') medicationId: string,
    @Body() dto: UpdateMedicationDto,
  ) {
    return this.healthService.updateMedication(familyId, medicationId, user.id, dto);
  }

  @Delete('medications/:medicationId')
  deleteMedication(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('medicationId') medicationId: string,
  ) {
    return this.healthService.deleteMedication(familyId, medicationId, user.id);
  }

  // ── Allergies ─────────────────────────────────────────────────────────────

  @Post('allergies')
  createAllergy(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Body() dto: CreateAllergyDto,
  ) {
    return this.healthService.createAllergy(familyId, user.id, dto);
  }

  @Get('allergies')
  getAllergies(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Query('childId') childId?: string,
  ) {
    return this.healthService.getAllergies(familyId, user.id, childId);
  }

  @Delete('allergies/:allergyId')
  deleteAllergy(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('allergyId') allergyId: string,
  ) {
    return this.healthService.deleteAllergy(familyId, allergyId, user.id);
  }
}
