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
  // Custom validator for validating the "DD-MM-YYYY" date format
  validate(value: string): boolean {
    const dateFormatRegex =
      /^(0[1-9]|[1-2][0-9]|3[0-1])-(0[1-9]|1[0-2])-\d{4}$/;
    return dateFormatRegex.test(value);
  }

  defaultMessage(): string {
    return 'Invalid date format. Please use "DD-MM-YYYY".';
  }
}

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

  @ApiProperty({
    description: `Coupon code's start date in MM-DD-YYYY format`,
    example: '11-22-2024',
    type: Date,
  })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @Validate(IsValidDateFormat)
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    description: `Coupon code's end date in MM-DD-YYYY format`,
    example: '12-22-2024',
    type: Date,
  })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @Validate(IsValidDateFormat)
  @Type(() => Date)
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

  @ApiProperty({
    description: `Coupon code's start date in MM-DD-YYYY format`,
    example: '11-22-2024',
    type: Date,
  })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @Validate(IsValidDateFormat)
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    description: `Coupon code's end date in MM-DD-YYYY format`,
    example: '12-22-2024',
    type: Date,
  })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @Validate(IsValidDateFormat)
  @Type(() => Date)
  endDate: Date;
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
