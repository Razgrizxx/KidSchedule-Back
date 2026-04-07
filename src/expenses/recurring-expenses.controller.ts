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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RecurringExpensesService } from './recurring-expenses.service';
import { CreateRecurringExpenseDto, UpdateRecurringExpenseDto } from './dto/recurring-expense.dto';

@UseGuards(JwtAuthGuard)
@Controller('families/:familyId/expenses/recurring')
export class RecurringExpensesController {
  constructor(private readonly service: RecurringExpensesService) {}

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Param('familyId') familyId: string,
    @Body() dto: CreateRecurringExpenseDto,
  ) {
    return this.service.create(familyId, user.id, dto);
  }

  @Get()
  findAll(@Param('familyId') familyId: string) {
    return this.service.findAll(familyId);
  }

  @Post('generate-due')
  generateDue(
    @CurrentUser() user: { id: string },
    @Param('familyId') familyId: string,
  ) {
    return this.service.generateDue(familyId, user.id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('familyId') familyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateRecurringExpenseDto,
  ) {
    return this.service.update(familyId, id, user.id, dto);
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
