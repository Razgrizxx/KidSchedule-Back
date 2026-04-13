import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { mkdirSync } from 'fs';
import type { Request, Response } from 'express';
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

  @Post('settle-all')
  settleAll(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
  ) {
    return this.expensesService.settleAll(familyId, user.id);
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

  @Get('export-csv')
  async exportCsv(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Query('from') from: string | undefined,
    @Query('to') to: string | undefined,
    @Res() res: Response,
  ) {
    const csv = await this.expensesService.exportCsv(familyId, user.id, from, to);
    const filename = `expenses-${familyId.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csv); // BOM for Excel UTF-8 compatibility
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

  @Patch(':expenseId/settle')
  settle(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('expenseId') expenseId: string,
  ) {
    return this.expensesService.settle(familyId, expenseId, user.id);
  }

  @Patch(':expenseId/unsettle')
  unsettle(
    @CurrentUser() user: AuthUser,
    @Param('familyId') familyId: string,
    @Param('expenseId') expenseId: string,
  ) {
    return this.expensesService.unsettle(familyId, expenseId, user.id);
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
