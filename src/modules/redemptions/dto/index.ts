import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class BlockCouponDto {
  @ApiProperty({
    description: 'The unique code of the coupon to be blocked',
    example: 'SUMMER2023',
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    description: 'The unique identifier of the order',
    example: 'ORDER123456',
  })
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @ApiProperty({
    description: 'The unique identifier of the user',
    example: 'USER987654',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'The total purchase amount for the order',
    example: 99.99,
  })
  @IsNotEmpty()
  @IsNumber()
  purchaseAmount: number;

  @ApiProperty({
    description: 'The unique identifier of the product (if applicable)',
    required: false,
    example: 'PROD123',
  })
  @IsOptional()
  @IsString()
  product?: string;

  @ApiProperty({
    description: 'The unique identifier of the category (if applicable)',
    required: false,
    example: 'CAT456',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: 'The user group name (if applicable)',
    required: false,
    example: 'PREMIUM_MEMBERS',
  })
  @IsOptional()
  @IsString()
  userGroup?: string;

  @ApiProperty({
    description: 'The location code (if applicable)',
    required: false,
    example: 'NYC001',
  })
  @IsOptional()
  @IsString()
  locationCode?: string;

  @ApiProperty({
    description: 'The payment method used (if applicable)',
    required: false,
    example: 'CREDIT_CARD',
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiProperty({
    description:
      'The channel through which the order is placed (if applicable)',
    required: false,
    example: 'MOBILE_APP',
  })
  @IsOptional()
  @IsString()
  channel?: string;
}

export class UnblockCouponDto {
  @ApiProperty({
    description:
      'The unique identifier of the order for which to unblock the coupon',
    example: 'ORDER123456',
  })
  @IsNotEmpty()
  @IsString()
  orderId: string;
}

export class RedeemCouponDto {
  @ApiProperty({
    description: 'The unique identifier of the user redeeming the coupon',
    example: 'USER987654',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description:
      'The unique identifier of the order for which the coupon is being redeemed',
    example: 'ORDER123456',
  })
  @IsNotEmpty()
  @IsString()
  orderId: string;
}
