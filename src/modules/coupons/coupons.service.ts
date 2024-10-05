/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import {
  CreateCouponDto,
  UpdateCouponDto,
  CategoryRestrictionDto,
  ChannelRestrictionDto,
  LocationCodeRestrictionDto,
  MaxUsesRestrictionDto,
  MinimumPurchaseRestrictionDto,
  PaymentMethodRestrictionDto,
  ProductRestrictionDto,
  UserGroupRestrictionDto,
  CouponRestrictionDto,
} from './dto';
import { PrismaService } from 'prisma/prisma.service';
import { RestrictionType } from '@prisma/client';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async create(createCouponDto: CreateCouponDto) {
    const {
      code,
      description,
      startDate,
      endDate,
      discountDetails,
      restrictions,
    } = createCouponDto;

    return this.prisma.$transaction(async (prisma) => {
      const coupon = await prisma.coupon.create({
        data: {
          code,
          description,
          startDate,
          endDate,
          discountDetails: {
            create: {
              discountType: discountDetails.discountType,
              discountValue: discountDetails.discountValue,
            },
          },
          restrictions:
            restrictions && restrictions.length > 0
              ? {
                  create: restrictions.map((restriction) => {
                    const baseRestriction = {
                      restrictionType: restriction.restrictionType,
                    };

                    switch (restriction.restrictionType) {
                      case RestrictionType.PRODUCT:
                        return {
                          ...baseRestriction,
                          productRestriction: {
                            create: {
                              products: {
                                connect: (
                                  restriction.restrictionValue as ProductRestrictionDto
                                ).productIds.map((id) => ({ id })),
                              },
                            },
                          },
                        };
                      case RestrictionType.CATEGORY:
                        return {
                          ...baseRestriction,
                          categoryRestriction: {
                            create: {
                              categories: {
                                connect: (
                                  restriction.restrictionValue as CategoryRestrictionDto
                                ).categoryIds.map((id) => ({ id })),
                              },
                            },
                          },
                        };
                      case RestrictionType.USER_GROUP:
                        return {
                          ...baseRestriction,
                          userGroupRestriction: {
                            create: {
                              userGroups: {
                                connect: (
                                  restriction.restrictionValue as UserGroupRestrictionDto
                                ).userGroupIds.map((id) => ({ id })),
                              },
                            },
                          },
                        };
                      case RestrictionType.MINIMUM_PURCHASE:
                        return {
                          ...baseRestriction,
                          minimumPurchaseRestriction: {
                            create: {
                              minimumAmount: (
                                restriction.restrictionValue as MinimumPurchaseRestrictionDto
                              ).minimumAmount,
                            },
                          },
                        };
                      case RestrictionType.LOCATION_CODE:
                        return {
                          ...baseRestriction,
                          locationCodeRestriction: {
                            create: {
                              locationCodes: {
                                connect: (
                                  restriction.restrictionValue as LocationCodeRestrictionDto
                                ).locationCodes.map((code) => ({ code })),
                              },
                            },
                          },
                        };
                      case RestrictionType.PAYMENT_METHOD:
                        return {
                          ...baseRestriction,
                          paymentMethodRestriction: {
                            create: {
                              paymentMethods: {
                                connect: (
                                  restriction.restrictionValue as PaymentMethodRestrictionDto
                                ).paymentMethodIds.map((id) => ({ id })),
                              },
                            },
                          },
                        };
                      case RestrictionType.CHANNEL:
                        return {
                          ...baseRestriction,
                          channelRestriction: {
                            create: {
                              channels: {
                                connect: (
                                  restriction.restrictionValue as ChannelRestrictionDto
                                ).channelIds.map((id) => ({ id })),
                              },
                            },
                          },
                        };
                      case RestrictionType.MAX_USES:
                        return {
                          ...baseRestriction,
                          maxUsesRestriction: {
                            create: {
                              maxUses: (
                                restriction.restrictionValue as MaxUsesRestrictionDto
                              ).maxUses,
                            },
                          },
                        };
                      default:
                        throw new Error(
                          `Unsupported restriction type: ${restriction.restrictionType}`,
                        );
                    }
                  }),
                }
              : undefined,
        },
      });

      return coupon;
    });
  }

  async update(id: string, updateCouponDto: UpdateCouponDto) {
    const {
      code,
      description,
      startDate,
      endDate,
      discountDetails,
      restrictions,
    } = updateCouponDto;

    return this.prisma.$transaction(async (prisma) => {
      // Update coupon details first
      const coupon = await prisma.coupon.update({
        where: { id },
        data: {
          code,
          description,
          startDate,
          endDate,
          discountDetails: discountDetails
            ? {
                upsert: {
                  create: {
                    discountType: discountDetails.discountType,
                    discountValue: discountDetails.discountValue,
                  },
                  update: {
                    discountType: discountDetails.discountType,
                    discountValue: discountDetails.discountValue,
                  },
                },
              }
            : undefined,
        },
      });

      if (restrictions) {
        // Delete restrictions that are not present in the update DTO
        const restrictionTypesToUpdate = restrictions.map(
          (restriction) => restriction.restrictionType,
        );

        await prisma.couponRestriction.deleteMany({
          where: {
            couponId: id,
            restrictionType: { notIn: restrictionTypesToUpdate },
          },
        });

        // Upsert new or existing restrictions
        for (const restriction of restrictions) {
          await prisma.couponRestriction.upsert({
            where: {
              couponId_restrictionType: {
                couponId: id,
                restrictionType: restriction.restrictionType,
              },
            },
            create: {
              restrictionType: restriction.restrictionType,
              coupon: { connect: { id } },
              ...this.getRestrictionCreateData(restriction),
            },
            update: this.getRestrictionUpdateData(restriction),
          });
        }
      }

      return coupon;
    });
  }

  private getRestrictionCreateData(restriction: CouponRestrictionDto) {
    switch (restriction.restrictionType) {
      case RestrictionType.PRODUCT:
        return {
          productRestriction: {
            create: {
              products: {
                connect: (
                  restriction.restrictionValue as ProductRestrictionDto
                ).productIds.map((id) => ({ id })),
              },
            },
          },
        };
      case RestrictionType.CATEGORY:
        return {
          categoryRestriction: {
            create: {
              categories: {
                connect: (
                  restriction.restrictionValue as CategoryRestrictionDto
                ).categoryIds.map((id) => ({ id })),
              },
            },
          },
        };
      case RestrictionType.USER_GROUP:
        return {
          userGroupRestriction: {
            create: {
              userGroups: {
                connect: (
                  restriction.restrictionValue as UserGroupRestrictionDto
                ).userGroupIds.map((id) => ({ id })),
              },
            },
          },
        };
      case RestrictionType.MINIMUM_PURCHASE:
        return {
          minimumPurchaseRestriction: {
            create: {
              minimumAmount: (
                restriction.restrictionValue as MinimumPurchaseRestrictionDto
              ).minimumAmount,
            },
          },
        };
      case RestrictionType.LOCATION_CODE:
        return {
          locationCodeRestriction: {
            create: {
              locationCodes: {
                connect: (
                  restriction.restrictionValue as LocationCodeRestrictionDto
                ).locationCodes.map((code) => ({ code })),
              },
            },
          },
        };
      case RestrictionType.PAYMENT_METHOD:
        return {
          paymentMethodRestriction: {
            create: {
              paymentMethods: {
                connect: (
                  restriction.restrictionValue as PaymentMethodRestrictionDto
                ).paymentMethodIds.map((id) => ({ id })),
              },
            },
          },
        };
      case RestrictionType.CHANNEL:
        return {
          channelRestriction: {
            create: {
              channels: {
                connect: (
                  restriction.restrictionValue as ChannelRestrictionDto
                ).channelIds.map((id) => ({ id })),
              },
            },
          },
        };
      case RestrictionType.MAX_USES:
        return {
          maxUsesRestriction: {
            create: {
              maxUses: (restriction.restrictionValue as MaxUsesRestrictionDto)
                .maxUses,
            },
          },
        };
      default:
        throw new Error(
          `Unsupported restriction type: ${restriction.restrictionType}`,
        );
    }
  }

  private getRestrictionUpdateData(restriction: CouponRestrictionDto) {
    switch (restriction.restrictionType) {
      case RestrictionType.PRODUCT:
        return {
          productRestriction: {
            update: {
              products: {
                set: (
                  restriction.restrictionValue as ProductRestrictionDto
                ).productIds.map((id) => ({ id })),
              },
            },
          },
        };
      case RestrictionType.CATEGORY:
        return {
          categoryRestriction: {
            update: {
              categories: {
                set: (
                  restriction.restrictionValue as CategoryRestrictionDto
                ).categoryIds.map((id) => ({ id })),
              },
            },
          },
        };
      case RestrictionType.USER_GROUP:
        return {
          userGroupRestriction: {
            update: {
              userGroups: {
                set: (
                  restriction.restrictionValue as UserGroupRestrictionDto
                ).userGroupIds.map((id) => ({ id })),
              },
            },
          },
        };
      case RestrictionType.MINIMUM_PURCHASE:
        return {
          minimumPurchaseRestriction: {
            update: {
              minimumAmount: (
                restriction.restrictionValue as MinimumPurchaseRestrictionDto
              ).minimumAmount,
            },
          },
        };
      case RestrictionType.LOCATION_CODE:
        return {
          locationCodeRestriction: {
            update: {
              locationCodes: {
                set: (
                  restriction.restrictionValue as LocationCodeRestrictionDto
                ).locationCodes.map((code) => ({ code })),
              },
            },
          },
        };
      case RestrictionType.PAYMENT_METHOD:
        return {
          paymentMethodRestriction: {
            update: {
              paymentMethods: {
                set: (
                  restriction.restrictionValue as PaymentMethodRestrictionDto
                ).paymentMethodIds.map((id) => ({ id })),
              },
            },
          },
        };
      case RestrictionType.CHANNEL:
        return {
          channelRestriction: {
            update: {
              channels: {
                set: (
                  restriction.restrictionValue as ChannelRestrictionDto
                ).channelIds.map((id) => ({ id })),
              },
            },
          },
        };
      case RestrictionType.MAX_USES:
        return {
          maxUsesRestriction: {
            update: {
              maxUses: (restriction.restrictionValue as MaxUsesRestrictionDto)
                .maxUses,
            },
          },
        };
      default:
        throw new Error(
          `Unsupported restriction type: ${restriction.restrictionType}`,
        );
    }
  }
  async findAll() {
    return this.prisma.coupon.findMany();
  }

  async findOne(id: string) {
    return this.prisma.coupon.findUnique({
      where: { id },
    });
  }

  async remove(id: string) {
    return this.prisma.coupon.delete({
      where: { id },
    });
  }
}
