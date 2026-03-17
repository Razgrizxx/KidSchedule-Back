import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types/auth-user';

@UseGuards(JwtAuthGuard)
@Controller('families/:familyId/expenses')
export class ExpensesController {
  constructor(private expensesService: ExpensesService) {}

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
