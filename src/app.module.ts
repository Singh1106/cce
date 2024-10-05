import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CouponsModule } from './coupons/coupons.module';
import { ReportsModule } from './reports/reports.module';
import { RedemptionsModule } from './redemptions/redemptions.module';

@Module({
  imports: [CouponsModule, ReportsModule, RedemptionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
