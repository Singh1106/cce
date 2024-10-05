/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  CouponRedemption,
  CouponRedemptionStatus,
  CouponRestriction,
  RestrictionType,
} from '@prisma/client';
import { BlockCouponDto, RedeemCouponDto } from './dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class RedemptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async blockCoupon(blockCouponDto: BlockCouponDto) {
    // Step 1: Fetch the coupon with its restrictions
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: blockCouponDto.code },
      include: {
        restrictions: true, // Include restrictions for further validation
      },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    // Step 2: Validate restrictions
    await this.checkRestrictions(coupon);

    // Step 3: Block the coupon by creating a new redemption
    return this.prisma.couponRedemption.create({
      data: {
        coupon: { connect: { id: coupon.id } },
        userId: blockCouponDto.userId, // Replace with actual user ID
        orderId: blockCouponDto.orderId, // Replace with actual order ID
        purchaseAmount: 100, // Replace with actual purchase amount
        discountAmount: 10, // Replace with actual discount amount
        status: CouponRedemptionStatus.BLOCKED, // Set the status to BLOCKED
        statusHistory: {
          create: {
            status: CouponRedemptionStatus.BLOCKED,
          },
        },
      },
    });
  }

  async claimCoupon(claimCouponDto: RedeemCouponDto) {
    const { userId, orderId } = claimCouponDto;

    const claimedCouponRedemption = await this.prisma.$transaction(
      async (prisma) => {
        // Check for blocked coupon redemption
        const blockedCouponRedemption =
          await prisma.couponRedemption.findUnique({
            where: {
              userId_orderId_status: {
                userId,
                orderId,
                status: CouponRedemptionStatus.BLOCKED,
              },
            },
          });

        if (!blockedCouponRedemption) {
          throw new NotFoundException('Blocked coupon redemption not found');
        }

        // Additional checks can be performed here if needed

        // Update the status of the blocked coupon redemption to COMPLETED
        const updatedRedemption = await prisma.couponRedemption.update({
          where: { id: blockedCouponRedemption.id },
          data: {
            status: CouponRedemptionStatus.COMPLETED, // Update the status
            // You may want to update other fields here if needed
          },
        });

        // Create a status history record for the status change
        await prisma.couponRedemptionStatusHistory.create({
          data: {
            status: CouponRedemptionStatus.COMPLETED,
            couponRedemption: {
              connect: { id: blockedCouponRedemption.id },
            },
          },
        });

        return updatedRedemption; // Return the updated coupon redemption details
      },
    );

    return claimedCouponRedemption; // Return the final result
  }

  private async checkRestrictions(coupon) {
    for (const restriction of coupon.restrictions) {
      switch (restriction.restrictionType) {
        case RestrictionType.PRODUCT:
          await this.checkProductRestrictions(restriction);
          break;
        case RestrictionType.CATEGORY:
          await this.checkCategoryRestrictions(restriction);
          break;
        case RestrictionType.USER_GROUP:
          await this.checkUserGroupRestrictions(restriction);
          break;
        case RestrictionType.MINIMUM_PURCHASE:
          await this.checkMinimumPurchaseRestrictions(restriction);
          break;
        case RestrictionType.LOCATION_CODE:
          await this.checkLocationCodeRestrictions(restriction);
          break;
        case RestrictionType.PAYMENT_METHOD:
          await this.checkPaymentMethodRestrictions(restriction);
          break;
        case RestrictionType.CHANNEL:
          await this.checkChannelRestrictions(restriction);
          break;
        case RestrictionType.MAX_USES:
          await this.checkMaxUsesRestrictions(restriction);
          break;
        default:
          throw new BadRequestException('Unknown restriction type');
      }
    }
  }

  private async checkProductRestrictions(restriction: CouponRestriction) {
    // Implement your logic to check product restrictions
    // e.g., verify if the product is in the user's cart or eligible products
  }

  private async checkCategoryRestrictions(restriction: CouponRestriction) {
    // Implement your logic to check category restrictions
  }

  private async checkUserGroupRestrictions(restriction: CouponRestriction) {
    // Implement your logic to check user group restrictions
  }

  private async checkMinimumPurchaseRestrictions(
    restriction: CouponRestriction,
  ) {
    // Implement your logic to check minimum purchase restrictions
  }

  private async checkLocationCodeRestrictions(restriction: CouponRestriction) {
    // Implement your logic to check location code restrictions
  }

  private async checkPaymentMethodRestrictions(restriction: CouponRestriction) {
    // Implement your logic to check payment method restrictions
  }

  private async checkChannelRestrictions(restriction: CouponRestriction) {
    // Implement your logic to check channel restrictions
  }

  private async checkMaxUsesRestrictions(restriction: CouponRestriction) {
    // Implement your logic to check max uses restrictions
  }
}
