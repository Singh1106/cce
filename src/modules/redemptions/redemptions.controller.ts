import { Body, Controller, Post } from '@nestjs/common';
import { BlockCouponDto, RedeemCouponDto } from './dto';
import { RedemptionsService } from './redemptions.service';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('redemptions')
@Controller('redemptions')
export class RedemptionsController {
  constructor(private readonly redemptionsService: RedemptionsService) {}

  @Post('block')
  async blockCoupon(@Body() blockCouponDto: BlockCouponDto) {
    return this.redemptionsService.blockCoupon(blockCouponDto);
  }

  // Redeem a coupon code
  @Post('claim')
  async redeemCouponCode(@Body() redeemCouponDto: RedeemCouponDto) {
    return await this.redemptionsService.claimCoupon(redeemCouponDto);
  }

  // @Post('unblock')
  // async unblockCoupon(@Body() unblockCouponDto: UnblockCouponDto) {
  //   return this.redemptionsService.unblockCoupon(unblockCouponDto.orderId);
  // }
}
