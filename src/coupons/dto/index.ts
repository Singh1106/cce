import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsDate,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { DiscountType, RestrictionType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CouponDiscountDetailsDto {
  @ApiProperty({ enum: DiscountType })
  @IsNotEmpty()
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  discountValue: number;
}

export class ProductRestrictionDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  productIds: string[];
}

export class CategoryRestrictionDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  categoryIds: string[];
}

export class UserGroupRestrictionDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  userGroupIds: string[];
}

export class MinimumPurchaseRestrictionDto {
  @ApiProperty()
  @IsNumber()
  minimumAmount: number;
}

export class LocationCodeRestrictionDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  locationCodes: string[];
}

export class PaymentMethodRestrictionDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  paymentMethodIds: string[];
}

export class ChannelRestrictionDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  channelIds: string[];
}

export class MaxUsesRestrictionDto {
  @ApiProperty()
  @IsNumber()
  maxUses: number;
}

export class CouponRestrictionDto {
  @ApiProperty({ enum: RestrictionType })
  @IsNotEmpty()
  @IsEnum(RestrictionType)
  restrictionType: RestrictionType;

  @ApiProperty({ type: Object })
  @ValidateNested()
  @Type(() => Object)
  restrictionValue:
    | ProductRestrictionDto
    | CategoryRestrictionDto
    | UserGroupRestrictionDto
    | MinimumPurchaseRestrictionDto
    | LocationCodeRestrictionDto
    | PaymentMethodRestrictionDto
    | ChannelRestrictionDto
    | MaxUsesRestrictionDto;
}

export class CreateCouponDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  startDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  endDate: Date;

  @ApiProperty()
  @ValidateNested()
  @Type(() => CouponDiscountDetailsDto)
  discountDetails: CouponDiscountDetailsDto;

  @ApiProperty({ type: [CouponRestrictionDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CouponRestrictionDto)
  restrictions?: CouponRestrictionDto[];
}

export class UpdateCouponDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  endDate?: Date;

  @ApiProperty()
  @IsOptional()
  @ValidateNested()
  @Type(() => CouponDiscountDetailsDto)
  discountDetails?: CouponDiscountDetailsDto;

  @ApiProperty({ type: [CouponRestrictionDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CouponRestrictionDto)
  restrictions?: CouponRestrictionDto[];
}
export class ValidateCouponDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  cartTotal: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  cartItems: CartItemDto[];
}

export class RedeemCouponDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  orderTotal: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  discountAmount: number;
}

export class CartItemDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  price: number;
}
