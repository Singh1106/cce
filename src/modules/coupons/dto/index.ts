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
  Validate,
} from 'class-validator';
import { DiscountType, RestrictionType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';

class IsValidDateFormat {
  validate(value: string): boolean {
    const dateFormatRegex =
      /^(0[1-9]|[1-2][0-9]|3[0-1])-(0[1-9]|1[0-2])-\d{4}$/;
    return dateFormatRegex.test(value);
  }

  defaultMessage(): string {
    return 'Invalid date format. Please use "MM-DD-YYYY".';
  }
}

export class CouponDiscountDetailsDto {
  @ApiProperty({
    enum: DiscountType,
    description: 'Type of discount to be applied',
    example: DiscountType.PERCENTAGE,
  })
  @IsNotEmpty()
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({
    description: 'Value of the discount (percentage or fixed amount)',
    example: 10,
  })
  @IsNotEmpty()
  @IsNumber()
  discountValue: number;
}

export class ProductRestrictionDto {
  @ApiProperty({
    type: [String],
    description: 'List of product IDs the coupon is restricted to',
    example: ['PROD001', 'PROD002'],
  })
  @IsArray()
  @IsString({ each: true })
  productIds: string[];
}

export class CategoryRestrictionDto {
  @ApiProperty({
    type: [String],
    description: 'List of category IDs the coupon is restricted to',
    example: ['CAT001', 'CAT002'],
  })
  @IsArray()
  @IsString({ each: true })
  categoryIds: string[];
}

export class UserGroupRestrictionDto {
  @ApiProperty({
    type: [String],
    description: 'List of user group IDs the coupon is restricted to',
    example: ['GROUP001', 'GROUP002'],
  })
  @IsArray()
  @IsString({ each: true })
  userGroupIds: string[];
}

export class MinimumPurchaseRestrictionDto {
  @ApiProperty({
    description: 'Minimum purchase amount required to use the coupon',
    example: 50.0,
  })
  @IsNumber()
  minimumAmount: number;
}

export class LocationCodeRestrictionDto {
  @ApiProperty({
    type: [String],
    description: 'List of location codes where the coupon can be used',
    example: ['NYC001', 'LA002'],
  })
  @IsArray()
  @IsString({ each: true })
  locationCodes: string[];
}

export class PaymentMethodRestrictionDto {
  @ApiProperty({
    type: [String],
    description: 'List of payment method IDs the coupon is restricted to',
    example: ['CREDIT_CARD', 'PAYPAL'],
  })
  @IsArray()
  @IsString({ each: true })
  paymentMethodIds: string[];
}

export class ChannelRestrictionDto {
  @ApiProperty({
    type: [String],
    description: 'List of channel IDs where the coupon can be used',
    example: ['ONLINE', 'IN_STORE'],
  })
  @IsArray()
  @IsString({ each: true })
  channelIds: string[];
}

export class MaxUsesRestrictionDto {
  @ApiProperty({
    description: 'Maximum number of times the coupon can be used',
    example: 100,
  })
  @IsNumber()
  maxUses: number;
}

export class CouponRestrictionDto {
  @ApiProperty({
    enum: RestrictionType,
    description: 'Type of restriction applied to the coupon',
    example: RestrictionType.PRODUCT,
  })
  @IsNotEmpty()
  @IsEnum(RestrictionType)
  restrictionType: RestrictionType;

  @ApiProperty({
    type: Object,
    description:
      'Specific details of the restriction based on the restriction type',
  })
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
  @ApiProperty({
    description: 'Unique code for the coupon',
    example: 'SUMMER2023',
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    required: false,
    description: 'Optional description of the coupon',
    example: 'Summer sale discount',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: `Coupon's start date in MM-DD-YYYY format`,
    example: '01-31-2023',
    type: Date,
  })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @Validate(IsValidDateFormat)
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    description: `Coupon's end date in MM-DD-YYYY format`,
    example: '08-31-2023',
    type: Date,
  })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @Validate(IsValidDateFormat)
  @Type(() => Date)
  endDate: Date;

  @ApiProperty({
    type: () => CouponDiscountDetailsDto,
    description: 'Details of the discount offered by the coupon',
  })
  @ValidateNested()
  @Type(() => CouponDiscountDetailsDto)
  discountDetails: CouponDiscountDetailsDto;

  @ApiProperty({
    type: [CouponRestrictionDto],
    required: false,
    description: 'List of restrictions applied to the coupon',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CouponRestrictionDto)
  restrictions?: CouponRestrictionDto[];
}

export class UpdateCouponDto {
  @ApiProperty({
    required: false,
    description: 'Updated code for the coupon',
    example: 'SUMMER2023_UPDATE',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({
    required: false,
    description: 'Updated description of the coupon',
    example: 'Extended summer sale discount',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    required: false,
    description: `Updated start date in DD-MM-YYYY format`,
    example: '15-06-2023',
    type: Date,
  })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @Validate(IsValidDateFormat)
  @Type(() => Date)
  startDate?: Date;

  @ApiProperty({
    required: false,
    description: `Updated end date in DD-MM-YYYY format`,
    example: '15-09-2023',
    type: Date,
  })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @Validate(IsValidDateFormat)
  @Type(() => Date)
  endDate?: Date;

  @ApiProperty({
    type: () => CouponDiscountDetailsDto,
    required: false,
    description: 'Updated discount details for the coupon',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CouponDiscountDetailsDto)
  discountDetails?: CouponDiscountDetailsDto;

  @ApiProperty({
    type: [CouponRestrictionDto],
    required: false,
    description: 'Updated list of restrictions for the coupon',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CouponRestrictionDto)
  restrictions?: CouponRestrictionDto[];
}
