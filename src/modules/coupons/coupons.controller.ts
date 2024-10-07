import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import {
  CreateCouponDto,
  FetchCouponsWithRestrictionsDto,
  UpdateCouponDto,
} from './dto';

@ApiTags('coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new coupon' })
  @ApiResponse({
    status: 201,
    description: 'The coupon has been successfully created.',
  })
  create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponsService.create(createCouponDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all coupons' })
  findAll() {
    return this.couponsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a coupon by id' })
  findOne(@Param('id') id: string) {
    return this.couponsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a coupon' })
  update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto) {
    return this.couponsService.update(id, updateCouponDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a coupon' })
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }

  // In coupons.controller.ts

  @Post('fetch-with-restrictions')
  @ApiOperation({ summary: 'Fetch coupons with restrictions' })
  @ApiResponse({
    status: 200,
    description:
      'Returns a list of valid coupons based on the provided criteria.',
  })
  fetchCouponsWithRestrictions(@Body() dto: FetchCouponsWithRestrictionsDto) {
    return this.couponsService.fetchCouponsWithRestrictions(dto);
  }
}
