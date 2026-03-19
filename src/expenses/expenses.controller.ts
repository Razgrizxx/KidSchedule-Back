import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { mkdirSync } from 'fs';
import type { Request } from 'express';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types/auth-user';

const ALLOWED_MIMETYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf',
];

@UseGuards(JwtAuthGuard)
@Controller('families/:familyId/expenses')
export class ExpensesController {
  constructor(private expensesService: ExpensesService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dest = 'uploads/receipts';
          mkdirSync(dest, { recursive: true });
          cb(null, dest);
        },
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `receipt-${unique}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        cb(null, ALLOWED_MIMETYPES.includes(file.mimetype));
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadReceipt(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return { url: `${baseUrl}/uploads/receipts/${file.filename}` };
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.expensesService.create(familyId, user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Param('familyId') familyId: string) {
    return this.expensesService.findAll(familyId, user.id);
  }

  @Get('balance')
  getBalance(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
  ) {
    return this.expensesService.getBalance(familyId, user.id);
  }

  @Get(':expenseId')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('expenseId') expenseId: string,
  ) {
    return this.expensesService.findOne(familyId, expenseId, user.id);
  }

  @Patch(':expenseId')
  update(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('expenseId') expenseId: string,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(familyId, expenseId, user.id, dto);
  }

  @Delete(':expenseId')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('expenseId') expenseId: string,
  ) {
    return this.expensesService.remove(familyId, expenseId, user.id);
  }
}
