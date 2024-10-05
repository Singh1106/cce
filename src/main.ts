import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaClientExceptionFilter } from '../prisma/exception/prisma-client-exception.filter';
import { envEnums } from './config/enums';
import { ConfigService } from '@nestjs/config';
import { ServerSettingsEnvVariables } from './config/types';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('CCE')
    .setDescription('Coupon Codes Engine')
    .setVersion('1.0')
    .addTag('coupon-code-engine')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      transform: true,
    }),
  );
  const config =
    app.get<ConfigService<ServerSettingsEnvVariables>>(ConfigService);
  const port = config.get<number>(envEnums.PORT);

  app.useGlobalFilters(new PrismaClientExceptionFilter());
  await app.listen(port);
}
bootstrap();
