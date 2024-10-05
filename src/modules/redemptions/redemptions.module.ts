import { Module } from '@nestjs/common';
import { RedemptionsService } from './redemptions.service';
import { RedemptionsController } from './redemptions.controller';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [RedemptionsController],
  providers: [RedemptionsService, PrismaService],
})
export class RedemptionsModule {}
