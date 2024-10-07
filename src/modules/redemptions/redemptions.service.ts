/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CouponDiscountDetails,
  CouponRedemptionStatus,
  DiscountType,
  RestrictionType,
} from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { BlockCouponDto, RedeemCouponDto } from './dto';

@Injectable()
export class RedemptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async blockCoupon(blockCouponDto: BlockCouponDto) {
    // Step 1: Fetch the coupon with its restrictions
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: blockCouponDto.code },
      include: {
        discountDetails: true,
        restrictions: true, // Include restrictions for further validation
      },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    // Step 2: Validate restrictions
    await this.checkRestrictions(coupon, blockCouponDto);
    const discountAmount = this.calculateDiscountAmount(
      coupon.discountDetails,
      blockCouponDto.purchaseAmount,
    );
    // Step 3: Block the coupon by creating a new redemption
    return this.prisma.couponRedemption.create({
      data: {
        coupon: { connect: { id: coupon.id } },
        userId: blockCouponDto.userId, // Replace with actual user ID
        orderId: blockCouponDto.orderId, // Replace with actual order ID
        purchaseAmount: blockCouponDto.purchaseAmount, // Replace with actual purchase amount
        discountAmount, // Replace with actual discount amount
        status: CouponRedemptionStatus.BLOCKED, // Set the status to BLOCKED
        statusHistory: {
          create: {
            status: CouponRedemptionStatus.BLOCKED,
          },
        },
      },
    });
  }
  private calculateDiscountAmount(
    discountDetails: CouponDiscountDetails,
    purchaseAmount: number,
  ): number {
    const value = Number(discountDetails.discountValue);
    switch (discountDetails.discountType) {
      case DiscountType.PERCENTAGE:
        return (purchaseAmount * value) / 100;
      case DiscountType.FIXED_AMOUNT:
        return value;
      case DiscountType.BUY_X_GET_Y_FREE:
        // Implement logic for BUY_X_GET_Y_FREE if applicable
        return 0; // Placeholder
      case DiscountType.FREE_SHIPPING:
        // Implement logic for FREE_SHIPPING if applicable
        return 0; // Placeholder
      default:
        throw new BadRequestException('Unknown discount type');
    }
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
  private async checkRestrictions(coupon, blockCouponDto: BlockCouponDto) {
    for (const restriction of coupon.restrictions) {
      switch (restriction.restrictionType) {
        case RestrictionType.PRODUCT:
          await this.checkProductRestrictions(restriction, blockCouponDto);
          break;
        case RestrictionType.CATEGORY:
          await this.checkCategoryRestrictions(restriction, blockCouponDto);
          break;
        case RestrictionType.USER_GROUP:
          await this.checkUserGroupRestrictions(restriction, blockCouponDto);
          break;
        case RestrictionType.MINIMUM_PURCHASE:
          await this.checkMinimumPurchaseRestrictions(
            restriction,
            blockCouponDto,
          );
          break;
        case RestrictionType.LOCATION_CODE:
          await this.checkLocationCodeRestrictions(restriction, blockCouponDto);
          break;
        case RestrictionType.PAYMENT_METHOD:
          await this.checkPaymentMethodRestrictions(
            restriction,
            blockCouponDto,
          );
          break;
        case RestrictionType.CHANNEL:
          await this.checkChannelRestrictions(restriction, blockCouponDto);
          break;
        case RestrictionType.MAX_USES:
          await this.checkMaxUsesRestrictions(restriction, blockCouponDto);
          break;
        case RestrictionType.MAX_USES_PER_USER:
          await this.checkMaxUsesPerUserRestrictions(
            restriction,
            blockCouponDto,
          );
          break;
        default:
          throw new BadRequestException('Unknown restriction type');
      }
    }
  }

  private async checkProductRestrictions(restriction, dto: BlockCouponDto) {
    if (!dto.product) {
      throw new BadRequestException('Product ID is required for this coupon');
    }

    const allowedProductIds = await this.prisma.productRestriction
      .findUnique({
        where: { restrictionId: restriction.id },
        include: { products: true },
      })
      .then((res) => res.products.map((p) => p.name));

    if (!allowedProductIds.includes(dto.product)) {
      throw new BadRequestException(
        'The product is not eligible for this coupon',
      );
    }
  }

  private async checkCategoryRestrictions(restriction, dto: BlockCouponDto) {
    if (!dto.category) {
      throw new BadRequestException('Category ID is required for this coupon');
    }

    const allowedCategoryIds = await this.prisma.categoryRestriction
      .findUnique({
        where: { restrictionId: restriction.id },
        include: { categories: true },
      })
      .then((res) => res.categories.map((c) => c.name));

    if (!allowedCategoryIds.includes(dto.category)) {
      throw new BadRequestException(
        'The category is not eligible for this coupon',
      );
    }
  }

  private async checkUserGroupRestrictions(restriction, dto: BlockCouponDto) {
    if (!dto.userGroup) {
      throw new BadRequestException('User group is required for this coupon');
    }

    const allowedUserGroups = await this.prisma.userGroupRestriction
      .findUnique({
        where: { restrictionId: restriction.id },
        include: { userGroups: true },
      })
      .then((res) => res.userGroups.map((ug) => ug.name));

    if (!allowedUserGroups.includes(dto.userGroup)) {
      throw new BadRequestException(
        'The user group is not eligible for this coupon',
      );
    }
  }

  private async checkMinimumPurchaseRestrictions(
    restriction,
    dto: BlockCouponDto,
  ) {
    const minimumPurchase =
      await this.prisma.minimumPurchaseRestriction.findUnique({
        where: { restrictionId: restriction.id },
      });

    if (dto.purchaseAmount < Number(minimumPurchase.minimumAmount)) {
      throw new BadRequestException(
        `Purchase amount must be at least ${minimumPurchase.minimumAmount}`,
      );
    }
  }

  private async checkLocationCodeRestrictions(
    restriction,
    dto: BlockCouponDto,
  ) {
    if (!dto.locationCode) {
      throw new BadRequestException(
        'Location code is required for this coupon',
      );
    }

    const allowedLocationCodes = await this.prisma.locationCodeRestriction
      .findUnique({
        where: { restrictionId: restriction.id },
        include: { locationCodes: true },
      })
      .then((res) => res.locationCodes.map((lc) => lc.code));

    if (!allowedLocationCodes.includes(dto.locationCode)) {
      throw new BadRequestException(
        'The location is not eligible for this coupon',
      );
    }
  }

  private async checkPaymentMethodRestrictions(
    restriction,
    dto: BlockCouponDto,
  ) {
    if (!dto.paymentMethod) {
      throw new BadRequestException(
        'Payment method is required for this coupon',
      );
    }

    const allowedPaymentMethods = await this.prisma.paymentMethodRestriction
      .findUnique({
        where: { restrictionId: restriction.id },
        include: { paymentMethods: true },
      })
      .then((res) => res.paymentMethods.map((pm) => pm.name));

    if (!allowedPaymentMethods.includes(dto.paymentMethod)) {
      throw new BadRequestException(
        'The payment method is not eligible for this coupon',
      );
    }
  }

  private async checkChannelRestrictions(restriction, dto: BlockCouponDto) {
    if (!dto.channel) {
      throw new BadRequestException('Channel is required for this coupon');
    }

    const allowedChannels = await this.prisma.channelRestriction
      .findUnique({
        where: { restrictionId: restriction.id },
        include: { channels: true },
      })
      .then((res) => res.channels.map((c) => c.name));

    if (!allowedChannels.includes(dto.channel)) {
      throw new BadRequestException(
        'The channel is not eligible for this coupon',
      );
    }
  }

  private async checkMaxUsesRestrictions(restriction, dto: BlockCouponDto) {
    const maxUsesRestriction = await this.prisma.maxUsesRestriction.findUnique({
      where: { restrictionId: restriction.id },
    });

    const currentUses = await this.prisma.couponRedemption.count({
      where: {
        couponId: restriction.couponId,
        status: {
          in: [
            CouponRedemptionStatus.COMPLETED,
            CouponRedemptionStatus.BLOCKED,
          ],
        },
      },
    });

    if (currentUses >= maxUsesRestriction.maxUses) {
      throw new BadRequestException(
        'Coupon has reached its maximum number of uses',
      );
    }
  }

  private async checkMaxUsesPerUserRestrictions(
    restriction,
    dto: BlockCouponDto,
  ) {
    const maxUsesPerUserRestriction =
      await this.prisma.maxUsesPerUserRestriction.findUnique({
        where: { restrictionId: restriction.id },
      });
    // maxuses would be at a categories level, for example
    const currentUsesPerUser = await this.prisma.couponRedemption.count({
      where: {
        userId: dto.userId,
        couponId: restriction.couponId,
        status: {
          in: [
            CouponRedemptionStatus.COMPLETED,
            CouponRedemptionStatus.BLOCKED,
          ],
        },
      },
    });

    if (currentUsesPerUser >= maxUsesPerUserRestriction.maxUsesPerUser) {
      throw new BadRequestException(
        'This user has reached its maximum number of uses for this coupon',
      );
    }
  }
}
