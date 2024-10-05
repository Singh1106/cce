import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CouponsModule } from './coupons/coupons.module';
import { RedemptionsModule } from './redemptions/redemptions.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [CouponsModule, RedemptionsModule, ReportsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
