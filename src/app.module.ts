import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CouponsModule } from './modules/coupons/coupons.module';
import { ReportsModule } from './modules/reports/reports.module';
import { RedemptionsModule } from './modules/redemptions/redemptions.module';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './config/env-schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
      validationSchema: envSchema,
    }),
    CouponsModule,
    ReportsModule,
    RedemptionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
