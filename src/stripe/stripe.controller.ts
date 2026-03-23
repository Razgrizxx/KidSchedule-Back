import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { SubscriptionService } from './subscription.service';
import { CreateCheckoutDto } from './dto/stripe.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types/auth-user';

@Controller('stripe')
export class StripeController {
  constructor(
    private stripeService: StripeService,
    private subService: SubscriptionService,
  ) {}

  // Webhook — no JWT guard, raw body required
  @Post('webhook')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  webhook(@Req() req: any, @Headers('stripe-signature') sig: string) {
    return this.stripeService.handleWebhook(req.rawBody as Buffer, sig);
  }

  // Authenticated endpoints
  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  checkout(@CurrentUser() user: AuthUser, @Body() dto: CreateCheckoutDto) {
    return this.stripeService.createCheckoutSession(user.id, dto.priceId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('portal')
  portal(@CurrentUser() user: AuthUser) {
    return this.stripeService.createPortalSession(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('subscription')
  getSubscription(@CurrentUser() user: AuthUser) {
    return this.subService.getFullSubscription(user.id);
  }
}
